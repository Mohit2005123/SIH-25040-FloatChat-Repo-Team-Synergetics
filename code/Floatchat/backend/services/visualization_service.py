import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from models import FloatData, OceanParameter
import logging

logger = logging.getLogger(__name__)

class VisualizationService:
    """Service for creating ocean data visualizations"""
    
    def __init__(self):
        self.session = SessionLocal()
    
    def create_map_visualization(self, region: str = "global", parameter: str = "temperature") -> Dict[str, Any]:
        """Create interactive map visualization of float data"""
        try:
            # Get float data based on region
            floats = self._get_floats_by_region(region)
            
            if not floats:
                return {"error": "No data available for the specified region"}
            
            # Create map
            fig = go.Figure()
            
            # Add float markers
            colors = self._get_parameter_colors(floats, parameter)
            
            fig.add_trace(go.Scattermapbox(
                lat=[f.latitude for f in floats],
                lon=[f.longitude for f in floats],
                mode='markers',
                marker=dict(
                    size=8,
                    color=colors,
                    colorscale='Viridis',
                    showscale=True,
                    colorbar=dict(
                        title=f"{parameter.title()}",
                        x=1.02
                    )
                ),
                text=[f"Float {f.float_id}<br>Temp: {f.temperature}°C<br>Salinity: {f.salinity} PSU" for f in floats],
                hovertemplate="%{text}<extra></extra>",
                name="ARGO Floats"
            ))
            
            # Update layout
            fig.update_layout(
                title=f"ARGO Float Distribution - {parameter.title()}",
                mapbox=dict(
                    style="open-street-map",
                    center=dict(lat=0, lon=0),
                    zoom=1
                ),
                height=600,
                margin=dict(l=0, r=0, t=40, b=0)
            )
            
            return {
                "plotly_json": fig.to_json(),
                "data_points": len(floats),
                "region": region,
                "parameter": parameter
            }
            
        except Exception as e:
            logger.error(f"Error creating map visualization: {e}")
            return {"error": str(e)}
    
    def create_time_series_chart(self, parameter: str, time_range: str = "7d", region: str = "global") -> Dict[str, Any]:
        """Create time series chart for ocean parameters"""
        try:
            # Get time range
            start_date = self._get_start_date(time_range)
            
            # Get parameter data
            data = self._get_parameter_time_series(parameter, start_date, region)
            
            if not data:
                return {"error": "No data available for the specified parameters"}
            
            # Create DataFrame
            df = pd.DataFrame(data)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.sort_values('timestamp')
            
            # Create chart
            fig = go.Figure()
            
            fig.add_trace(go.Scatter(
                x=df['timestamp'],
                y=df['value'],
                mode='lines+markers',
                name=parameter.title(),
                line=dict(width=2),
                marker=dict(size=4)
            ))
            
            # Add trend line
            if len(df) > 1:
                z = np.polyfit(range(len(df)), df['value'], 1)
                p = np.poly1d(z)
                fig.add_trace(go.Scatter(
                    x=df['timestamp'],
                    y=p(range(len(df))),
                    mode='lines',
                    name='Trend',
                    line=dict(dash='dash', color='red')
                ))
            
            # Update layout
            fig.update_layout(
                title=f"{parameter.title()} Trends - {time_range}",
                xaxis_title="Time",
                yaxis_title=f"{parameter.title()} ({self._get_parameter_unit(parameter)})",
                height=400,
                showlegend=True,
                hovermode='x unified'
            )
            
            return {
                "plotly_json": fig.to_json(),
                "data_points": len(df),
                "parameter": parameter,
                "time_range": time_range,
                "statistics": self._calculate_statistics(df['value'])
            }
            
        except Exception as e:
            logger.error(f"Error creating time series chart: {e}")
            return {"error": str(e)}
    
    def create_depth_profile(self, float_id: str) -> Dict[str, Any]:
        """Create depth profile visualization for a specific float"""
        try:
            # Get parameter data for the float
            parameters = self.session.query(OceanParameter).filter(
                OceanParameter.float_id == float_id
            ).all()
            
            if not parameters:
                return {"error": f"No data available for float {float_id}"}
            
            # Group by parameter
            param_data = {}
            for param in parameters:
                if param.parameter_name not in param_data:
                    param_data[param.parameter_name] = []
                param_data[param.parameter_name].append({
                    'depth': param.depth_level,
                    'value': param.parameter_value,
                    'unit': param.parameter_unit
                })
            
            # Create subplots
            from plotly.subplots import make_subplots
            
            fig = make_subplots(
                rows=1, cols=len(param_data),
                subplot_titles=list(param_data.keys()),
                horizontal_spacing=0.1
            )
            
            for i, (param_name, data) in enumerate(param_data.items(), 1):
                df = pd.DataFrame(data)
                df = df.sort_values('depth')
                
                fig.add_trace(
                    go.Scatter(
                        x=df['value'],
                        y=df['depth'],
                        mode='lines+markers',
                        name=param_name,
                        line=dict(width=2)
                    ),
                    row=1, col=i
                )
                
                fig.update_xaxes(title_text=f"{param_name} ({data[0]['unit']})", row=1, col=i)
            
            fig.update_yaxes(title_text="Depth (m)", row=1, col=1)
            fig.update_layout(
                title=f"Depth Profile - Float {float_id}",
                height=500,
                showlegend=False
            )
            
            return {
                "plotly_json": fig.to_json(),
                "float_id": float_id,
                "parameters": list(param_data.keys()),
                "data_points": len(parameters)
            }
            
        except Exception as e:
            logger.error(f"Error creating depth profile: {e}")
            return {"error": str(e)}
    
    def create_parameter_comparison(self, parameter: str, regions: List[str]) -> Dict[str, Any]:
        """Create comparison chart between different regions"""
        try:
            fig = go.Figure()
            
            colors = px.colors.qualitative.Set1
            
            for i, region in enumerate(regions):
                data = self._get_parameter_data_by_region(parameter, region)
                
                if data:
                    df = pd.DataFrame(data)
                    df['timestamp'] = pd.to_datetime(df['timestamp'])
                    df = df.sort_values('timestamp')
                    
                    # Calculate daily averages
                    daily_avg = df.groupby(df['timestamp'].dt.date)['value'].mean().reset_index()
                    daily_avg['timestamp'] = pd.to_datetime(daily_avg['timestamp'])
                    
                    fig.add_trace(go.Scatter(
                        x=daily_avg['timestamp'],
                        y=daily_avg['value'],
                        mode='lines+markers',
                        name=region.title(),
                        line=dict(color=colors[i % len(colors)], width=2),
                        marker=dict(size=4)
                    ))
            
            fig.update_layout(
                title=f"{parameter.title()} Comparison Across Regions",
                xaxis_title="Time",
                yaxis_title=f"{parameter.title()} ({self._get_parameter_unit(parameter)})",
                height=500,
                hovermode='x unified'
            )
            
            return {
                "plotly_json": fig.to_json(),
                "parameter": parameter,
                "regions": regions,
                "data_points": sum(len(self._get_parameter_data_by_region(parameter, region)) for region in regions)
            }
            
        except Exception as e:
            logger.error(f"Error creating parameter comparison: {e}")
            return {"error": str(e)}
    
    def create_3d_visualization(self, parameter: str, region: str = "global") -> Dict[str, Any]:
        """Create 3D visualization of ocean data"""
        try:
            # Get float data
            floats = self._get_floats_by_region(region)
            
            if not floats:
                return {"error": "No data available for 3D visualization"}
            
            # Prepare data for 3D plot
            x = [f.longitude for f in floats]
            y = [f.latitude for f in floats]
            z = [f.depth for f in floats]
            values = self._get_parameter_values(floats, parameter)
            
            # Create 3D scatter plot
            fig = go.Figure(data=go.Scatter3d(
                x=x,
                y=y,
                z=z,
                mode='markers',
                marker=dict(
                    size=5,
                    color=values,
                    colorscale='Viridis',
                    showscale=True,
                    colorbar=dict(title=f"{parameter.title()}")
                ),
                text=[f"Float {f.float_id}" for f in floats],
                hovertemplate="%{text}<br>Longitude: %{x}<br>Latitude: %{y}<br>Depth: %{z}<br>Value: %{marker.color}<extra></extra>"
            ))
            
            fig.update_layout(
                title=f"3D Ocean Data Visualization - {parameter.title()}",
                scene=dict(
                    xaxis_title="Longitude",
                    yaxis_title="Latitude",
                    zaxis_title="Depth (m)"
                ),
                height=600
            )
            
            return {
                "plotly_json": fig.to_json(),
                "parameter": parameter,
                "region": region,
                "data_points": len(floats)
            }
            
        except Exception as e:
            logger.error(f"Error creating 3D visualization: {e}")
            return {"error": str(e)}
    
    def _get_floats_by_region(self, region: str) -> List[FloatData]:
        """Get floats filtered by region"""
        if region == "global":
            return self.session.query(FloatData).filter(FloatData.status == 'active').all()
        elif region == "indian":
            return self.session.query(FloatData).filter(
                FloatData.longitude.between(20, 120),
                FloatData.latitude.between(-30, 30),
                FloatData.status == 'active'
            ).all()
        elif region == "pacific":
            return self.session.query(FloatData).filter(
                FloatData.longitude.between(120, -60),
                FloatData.latitude.between(-60, 60),
                FloatData.status == 'active'
            ).all()
        elif region == "atlantic":
            return self.session.query(FloatData).filter(
                FloatData.longitude.between(-60, 20),
                FloatData.latitude.between(-60, 60),
                FloatData.status == 'active'
            ).all()
        else:
            return self.session.query(FloatData).filter(FloatData.status == 'active').all()
    
    def _get_parameter_colors(self, floats: List[FloatData], parameter: str) -> List[float]:
        """Get color values for parameter visualization"""
        values = self._get_parameter_values(floats, parameter)
        return [v for v in values if v is not None]
    
    def _get_parameter_values(self, floats: List[FloatData], parameter: str) -> List[Optional[float]]:
        """Get parameter values from float data"""
        if parameter == "temperature":
            return [f.temperature for f in floats]
        elif parameter == "salinity":
            return [f.salinity for f in floats]
        elif parameter == "pressure":
            return [f.pressure for f in floats]
        elif parameter == "oxygen":
            return [f.oxygen for f in floats]
        elif parameter == "ph":
            return [f.ph for f in floats]
        elif parameter == "chlorophyll":
            return [f.chlorophyll for f in floats]
        else:
            return [f.temperature for f in floats]
    
    def _get_parameter_unit(self, parameter: str) -> str:
        """Get unit for parameter"""
        units = {
            "temperature": "°C",
            "salinity": "PSU",
            "pressure": "dbar",
            "oxygen": "mg/L",
            "ph": "pH",
            "chlorophyll": "mg/m³"
        }
        return units.get(parameter, "")
    
    def _get_start_date(self, time_range: str) -> datetime:
        """Get start date based on time range"""
        now = datetime.utcnow()
        if time_range == "24h":
            return now - timedelta(hours=24)
        elif time_range == "7d":
            return now - timedelta(days=7)
        elif time_range == "30d":
            return now - timedelta(days=30)
        elif time_range == "90d":
            return now - timedelta(days=90)
        else:
            return now - timedelta(days=7)
    
    def _get_parameter_time_series(self, parameter: str, start_date: datetime, region: str) -> List[Dict[str, Any]]:
        """Get parameter time series data"""
        floats = self._get_floats_by_region(region)
        data = []
        
        for float_data in floats:
            value = self._get_parameter_values([float_data], parameter)[0]
            if value is not None and float_data.timestamp >= start_date:
                data.append({
                    'timestamp': float_data.timestamp,
                    'value': value,
                    'float_id': float_data.float_id
                })
        
        return data
    
    def _get_parameter_data_by_region(self, parameter: str, region: str) -> List[Dict[str, Any]]:
        """Get parameter data for a specific region"""
        return self._get_parameter_time_series(parameter, datetime.utcnow() - timedelta(days=30), region)
    
    def _calculate_statistics(self, values: List[float]) -> Dict[str, float]:
        """Calculate basic statistics for values"""
        if not values:
            return {}
        
        return {
            'mean': float(np.mean(values)),
            'median': float(np.median(values)),
            'std': float(np.std(values)),
            'min': float(np.min(values)),
            'max': float(np.max(values)),
            'count': len(values)
        }
    
    def __del__(self):
        """Cleanup on destruction"""
        if hasattr(self, 'session'):
            self.session.close()
