import asyncio
import aiohttp
import xarray as xr
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from database import SessionLocal
from models import FloatData, OceanParameter, DataSource, SystemMetrics
import netCDF4 as nc
from io import BytesIO
import json

logger = logging.getLogger(__name__)

class DataIngestionService:
    """Service for ingesting ARGO NetCDF data and storing in database"""
    
    def __init__(self):
        self.session = SessionLocal()
        self.is_running = False
        self.argo_base_url = "https://data-argo.ifremer.fr/geo/"
        self.erddap_url = "https://erddap.ifremer.fr/erddap/tabledap/ArgoFloats.html"
        
    async def start_background_ingestion(self):
        """Start background data ingestion process"""
        self.is_running = True
        asyncio.create_task(self._ingestion_loop())
        logger.info("Background data ingestion started")
    
    async def stop_background_ingestion(self):
        """Stop background data ingestion process"""
        self.is_running = False
        logger.info("Background data ingestion stopped")
    
    async def _ingestion_loop(self):
        """Main ingestion loop"""
        while self.is_running:
            try:
                await self.sync_argo_data()
                await asyncio.sleep(3600)  # Run every hour
            except Exception as e:
                logger.error(f"Error in ingestion loop: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes on error
    
    async def sync_argo_data(self):
        """Sync ARGO data from various sources"""
        try:
            logger.info("Starting ARGO data sync...")
            
            # Get recent float data from ERDDAP
            recent_floats = await self._fetch_recent_floats()
            
            # Process each float
            for float_data in recent_floats:
                await self._process_float_data(float_data)
            
            # Update system metrics
            await self._update_system_metrics()
            
            logger.info(f"ARGO data sync completed. Processed {len(recent_floats)} floats")
            
        except Exception as e:
            logger.error(f"Error syncing ARGO data: {e}")
            raise
    
    async def _fetch_recent_floats(self) -> List[Dict[str, Any]]:
        """Fetch recent ARGO float data from ERDDAP"""
        try:
            # ERDDAP query for recent floats
            query_params = {
                'platform_number,latitude,longitude,time,pres,temp,psal,oxygen,ph,chla',
                'time>=2024-01-01T00:00:00Z',
                'orderBy("time")'
            }
            
            url = f"{self.erddap_url}?{','.join(query_params)}"

            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.text()
                        return self._parse_erddap_data(data)
                    else:
                        logger.error(f"ERDDAP request failed: {response.status}")
                        return []
        
        except Exception as e:
            logger.error(f"Error fetching recent floats: {e}")
            return []
    
    def _parse_erddap_data(self, data: str) -> List[Dict[str, Any]]:
        """Parse ERDDAP CSV data"""
        try:
            # Split by lines and skip header
            lines = data.strip().split('\n')
            if len(lines) < 2:
                return []
            
            headers = lines[0].split(',')
            floats_data = []
            
            for line in lines[1:]:
                values = line.split(',')
                if len(values) >= len(headers):
                    float_data = {}
                    for i, header in enumerate(headers):
                        try:
                            value = values[i].strip()
                            if value and value != 'NaN':
                                if header in ['latitude', 'longitude', 'pres', 'temp', 'psal', 'oxygen', 'ph', 'chla']:
                                    float_data[header] = float(value)
                                elif header == 'platform_number':
                                    float_data[header] = value
                                elif header == 'time':
                                    float_data[header] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                        except (ValueError, IndexError):
                            continue
                    
                    if 'platform_number' in float_data and 'latitude' in float_data:
                        floats_data.append(float_data)
            
            return floats_data
        
        except Exception as e:
            logger.error(f"Error parsing ERDDAP data: {e}")
            return []
    
    async def _process_float_data(self, float_data: Dict[str, Any]):
        """Process individual float data and store in database"""
        try:
            float_id = float_data.get('platform_number')
            if not float_id:
                return
            
            # Check if float already exists
            existing_float = self.session.query(FloatData).filter(
                FloatData.float_id == float_id
            ).first()
            
            if existing_float:
                # Update existing float
                existing_float.latitude = float_data.get('latitude', existing_float.latitude)
                existing_float.longitude = float_data.get('longitude', existing_float.longitude)
                existing_float.temperature = float_data.get('temp', existing_float.temperature)
                existing_float.salinity = float_data.get('psal', existing_float.salinity)
                existing_float.pressure = float_data.get('pres', existing_float.pressure)
                existing_float.oxygen = float_data.get('oxygen', existing_float.oxygen)
                existing_float.ph = float_data.get('ph', existing_float.ph)
                existing_float.chlorophyll = float_data.get('chla', existing_float.chlorophyll)
                existing_float.timestamp = float_data.get('time', existing_float.timestamp)
                existing_float.updated_at = datetime.utcnow()
            else:
                # Create new float
                new_float = FloatData(
                    float_id=float_id,
                    latitude=float_data.get('latitude', 0.0),
                    longitude=float_data.get('longitude', 0.0),
                    depth=float_data.get('pres', 0.0),
                    temperature=float_data.get('temp'),
                    salinity=float_data.get('psal'),
                    pressure=float_data.get('pres'),
                    oxygen=float_data.get('oxygen'),
                    ph=float_data.get('ph'),
                    chlorophyll=float_data.get('chla'),
                    timestamp=float_data.get('time', datetime.utcnow()),
                    status='active'
                )
                self.session.add(new_float)
            
            # Store individual parameter measurements
            await self._store_parameter_measurements(float_id, float_data)
            
            self.session.commit()
            
        except Exception as e:
            logger.error(f"Error processing float data for {float_id}: {e}")
            self.session.rollback()
    
    async def _store_parameter_measurements(self, float_id: str, float_data: Dict[str, Any]):
        """Store individual parameter measurements"""
        try:
            parameters = {
                'temperature': ('temp', '°C'),
                'salinity': ('psal', 'PSU'),
                'pressure': ('pres', 'dbar'),
                'oxygen': ('oxygen', 'mg/L'),
                'ph': ('ph', 'pH'),
                'chlorophyll': ('chla', 'mg/m³')
            }
            
            for param_name, (data_key, unit) in parameters.items():
                if data_key in float_data and float_data[data_key] is not None:
                    measurement = OceanParameter(
                        float_id=float_id,
                        parameter_name=param_name,
                        parameter_value=float_data[data_key],
                        parameter_unit=unit,
                        depth_level=float_data.get('pres', 0.0),
                        measurement_time=float_data.get('time', datetime.utcnow()),
                        quality_flag='good'
                    )
                    self.session.add(measurement)
        
        except Exception as e:
            logger.error(f"Error storing parameter measurements: {e}")
    
    async def _update_system_metrics(self):
        """Update system performance metrics"""
        try:
            # Count total floats
            total_floats = self.session.query(FloatData).count()
            
            # Count active floats
            active_floats = self.session.query(FloatData).filter(
                FloatData.status == 'active'
            ).count()
            
            # Count total measurements
            total_measurements = self.session.query(OceanParameter).count()
            
            # Store metrics
            metrics = [
                SystemMetrics(metric_name='total_floats', metric_value=total_floats),
                SystemMetrics(metric_name='active_floats', metric_value=active_floats),
                SystemMetrics(metric_name='total_measurements', metric_value=total_measurements),
                SystemMetrics(metric_name='data_ingestion_time', metric_value=datetime.utcnow().timestamp())
            ]
            
            for metric in metrics:
                self.session.add(metric)
            
            self.session.commit()
            
        except Exception as e:
            logger.error(f"Error updating system metrics: {e}")
            self.session.rollback()
    
    async def ingest_netcdf_file(self, file_path: str) -> Dict[str, Any]:
        """Ingest a NetCDF file and extract data"""
        try:
            # Open NetCDF file
            with nc.Dataset(file_path, 'r') as dataset:
                # Extract basic information
                float_id = getattr(dataset, 'platform_number', 'unknown')
                latitude = dataset.variables.get('LATITUDE', [0])[:]
                longitude = dataset.variables.get('LONGITUDE', [0])[:]
                time = dataset.variables.get('TIME', [0])[:]
                
                # Extract parameter data
                data = {
                    'float_id': float_id,
                    'latitude': float(latitude[0]) if len(latitude) > 0 else 0.0,
                    'longitude': float(longitude[0]) if len(longitude) > 0 else 0.0,
                    'timestamp': datetime.fromtimestamp(time[0]) if len(time) > 0 else datetime.utcnow(),
                    'parameters': {}
                }
                
                # Extract ocean parameters
                parameter_mapping = {
                    'TEMP': 'temperature',
                    'PSAL': 'salinity',
                    'PRES': 'pressure',
                    'DOXY': 'oxygen',
                    'PH_IN_SITU_TOTAL': 'ph',
                    'CHLA': 'chlorophyll'
                }
                
                for nc_var, param_name in parameter_mapping.items():
                    if nc_var in dataset.variables:
                        var_data = dataset.variables[nc_var][:]
                        if len(var_data) > 0 and not np.isnan(var_data[0]):
                            data['parameters'][param_name] = float(var_data[0])
                
                return data
        
        except Exception as e:
            logger.error(f"Error ingesting NetCDF file {file_path}: {e}")
            raise
    
    def get_float_statistics(self) -> Dict[str, Any]:
        """Get statistics about stored float data"""
        try:
            total_floats = self.session.query(FloatData).count()
            active_floats = self.session.query(FloatData).filter(
                FloatData.status == 'active'
            ).count()
            
            # Get parameter statistics
            temp_data = self.session.query(FloatData.temperature).filter(
                FloatData.temperature.isnot(None)
            ).all()
            
            temp_values = [t[0] for t in temp_data if t[0] is not None]
            
            stats = {
                'total_floats': total_floats,
                'active_floats': active_floats,
                'temperature_stats': {
                    'count': len(temp_values),
                    'mean': np.mean(temp_values) if temp_values else 0,
                    'min': np.min(temp_values) if temp_values else 0,
                    'max': np.max(temp_values) if temp_values else 0
                } if temp_values else None
            }
            
            return stats
        
        except Exception as e:
            logger.error(f"Error getting float statistics: {e}")
            return {}
    
    def __del__(self):
        """Cleanup on destruction"""
        if hasattr(self, 'session'):
            self.session.close()
