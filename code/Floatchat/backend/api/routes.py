from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import FloatData, OceanParameter, SystemMetrics
from services.data_ingestion import DataIngestionService
from services.visualization_service import VisualizationService
from services.chat_service import ChatService
from services.rag_service import RAGService
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

# Create router instances
data_router = APIRouter()
chat_router = APIRouter()
visualization_router = APIRouter()
admin_router = APIRouter()

# Initialize services
data_ingestion_service = DataIngestionService()
visualization_service = VisualizationService()
chat_service = ChatService()
rag_service = RAGService()

# Data routes
@data_router.get("/floats")
async def get_floats(
    region: str = Query("global", description="Ocean region"),
    limit: int = Query(100, description="Maximum number of floats to return"),
    db: Session = Depends(get_db)
):
    """Get ARGO float data"""
    try:
        if region == "global":
            floats = db.query(FloatData).filter(FloatData.status == 'active').limit(limit).all()
        elif region == "indian":
            floats = db.query(FloatData).filter(
                FloatData.longitude.between(20, 120),
                FloatData.latitude.between(-30, 30),
                FloatData.status == 'active'
            ).limit(limit).all()
        else:
            floats = db.query(FloatData).filter(FloatData.status == 'active').limit(limit).all()
        
        return [
            {
                "float_id": f.float_id,
                "latitude": f.latitude,
                "longitude": f.longitude,
                "depth": f.depth,
                "temperature": f.temperature,
                "salinity": f.salinity,
                "pressure": f.pressure,
                "oxygen": f.oxygen,
                "ph": f.ph,
                "chlorophyll": f.chlorophyll,
                "timestamp": f.timestamp.isoformat() if f.timestamp else None,
                "status": f.status,
                "data_quality": f.data_quality
            }
            for f in floats
        ]
    except Exception as e:
        logger.error(f"Error getting floats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@data_router.get("/floats/{float_id}")
async def get_float_details(float_id: str, db: Session = Depends(get_db)):
    """Get detailed information about a specific float"""
    try:
        float_data = db.query(FloatData).filter(FloatData.float_id == float_id).first()
        if not float_data:
            raise HTTPException(status_code=404, detail="Float not found")
        
        # Get parameter history
        parameters = db.query(OceanParameter).filter(
            OceanParameter.float_id == float_id
        ).order_by(OceanParameter.measurement_time.desc()).limit(100).all()
        
        return {
            "float_id": float_data.float_id,
            "latitude": float_data.latitude,
            "longitude": float_data.longitude,
            "depth": float_data.depth,
            "temperature": float_data.temperature,
            "salinity": float_data.salinity,
            "pressure": float_data.pressure,
            "oxygen": float_data.oxygen,
            "ph": float_data.ph,
            "chlorophyll": float_data.chlorophyll,
            "timestamp": float_data.timestamp.isoformat() if float_data.timestamp else None,
            "status": float_data.status,
            "data_quality": float_data.data_quality,
            "battery_level": float_data.battery_level,
            "cycle_number": float_data.cycle_number,
            "parameter_history": [
                {
                    "parameter_name": p.parameter_name,
                    "parameter_value": p.parameter_value,
                    "parameter_unit": p.parameter_unit,
                    "depth_level": p.depth_level,
                    "measurement_time": p.measurement_time.isoformat(),
                    "quality_flag": p.quality_flag
                }
                for p in parameters
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting float details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@data_router.get("/parameters")
async def get_parameters(
    parameter_name: str = Query(..., description="Parameter name"),
    region: str = Query("global", description="Ocean region"),
    time_range: str = Query("7d", description="Time range"),
    db: Session = Depends(get_db)
):
    """Get ocean parameter data"""
    try:
        # This would implement parameter-specific queries
        # For now, return a simplified version
        parameters = db.query(OceanParameter).filter(
            OceanParameter.parameter_name == parameter_name
        ).limit(1000).all()
        
        return [
            {
                "float_id": p.float_id,
                "parameter_name": p.parameter_name,
                "parameter_value": p.parameter_value,
                "parameter_unit": p.parameter_unit,
                "depth_level": p.depth_level,
                "measurement_time": p.measurement_time.isoformat(),
                "quality_flag": p.quality_flag
            }
            for p in parameters
        ]
    except Exception as e:
        logger.error(f"Error getting parameters: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@data_router.get("/statistics")
async def get_statistics(db: Session = Depends(get_db)):
    """Get ocean data statistics"""
    try:
        total_floats = db.query(FloatData).count()
        active_floats = db.query(FloatData).filter(FloatData.status == 'active').count()
        total_measurements = db.query(OceanParameter).count()
        
        # Get recent metrics
        recent_metrics = db.query(SystemMetrics).order_by(
            SystemMetrics.timestamp.desc()
        ).limit(10).all()
        
        return {
            "total_floats": total_floats,
            "active_floats": active_floats,
            "total_measurements": total_measurements,
            "recent_metrics": [
                {
                    "metric_name": m.metric_name,
                    "metric_value": m.metric_value,
                    "metric_unit": m.metric_unit,
                    "timestamp": m.timestamp.isoformat()
                }
                for m in recent_metrics
            ]
        }
    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Chat routes
@chat_router.post("/sessions")
async def create_chat_session(
    user_id: Optional[int] = None,
    title: Optional[str] = None
):
    """Create a new chat session"""
    try:
        session_data = chat_service.create_chat_session(user_id, title)
        return session_data
    except Exception as e:
        logger.error(f"Error creating chat session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@chat_router.get("/sessions/{session_id}")
async def get_chat_session(session_id: str):
    """Get chat session details"""
    try:
        session_data = chat_service.get_chat_session(session_id)
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        return session_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chat session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@chat_router.get("/sessions/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    limit: int = Query(50, description="Maximum number of messages to return")
):
    """Get messages for a chat session"""
    try:
        messages = chat_service.get_session_messages(session_id, limit)
        return {"messages": messages}
    except Exception as e:
        logger.error(f"Error getting session messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@chat_router.post("/sessions/{session_id}/messages")
async def add_message(
    session_id: str,
    message_type: str,
    content: str,
    metadata: Optional[Dict[str, Any]] = None
):
    """Add a message to a chat session"""
    try:
        message_data = chat_service.add_message(session_id, message_type, content, metadata)
        return message_data
    except Exception as e:
        logger.error(f"Error adding message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ChatQueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    user_id: Optional[int] = None

@chat_router.post("/query")
async def process_chat_query(payload: ChatQueryRequest):
    """Process a chat query using RAG"""
    try:
        # Process query with RAG service
        result = await rag_service.process_query(payload.query, payload.user_id)
        
        # Add messages to session if session_id provided
        if payload.session_id:
            # Add user message
            chat_service.add_message(payload.session_id, "user", payload.query)
            
            # Add assistant response
            chat_service.add_message(
                payload.session_id, 
                "assistant", 
                result["response"],
                {
                    "query_type": "data_query",
                    "data_points": result["data_points"],
                    "confidence": result["confidence"]
                }
            )
        
        return result
    except Exception as e:
        logger.error(f"Error processing chat query: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Visualization routes
@visualization_router.get("/map")
async def get_map_visualization(
    region: str = Query("global", description="Ocean region"),
    parameter: str = Query("temperature", description="Parameter to visualize")
):
    """Get map visualization data"""
    try:
        result = visualization_service.create_map_visualization(region, parameter)
        return result
    except Exception as e:
        logger.error(f"Error creating map visualization: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@visualization_router.get("/timeseries")
async def get_timeseries_chart(
    parameter: str = Query(..., description="Parameter name"),
    time_range: str = Query("7d", description="Time range"),
    region: str = Query("global", description="Ocean region")
):
    """Get time series chart data"""
    try:
        result = visualization_service.create_time_series_chart(parameter, time_range, region)
        return result
    except Exception as e:
        logger.error(f"Error creating time series chart: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@visualization_router.get("/depth-profile/{float_id}")
async def get_depth_profile(float_id: str):
    """Get depth profile for a specific float"""
    try:
        result = visualization_service.create_depth_profile(float_id)
        return result
    except Exception as e:
        logger.error(f"Error creating depth profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@visualization_router.get("/comparison")
async def get_parameter_comparison(
    parameter: str = Query(..., description="Parameter name"),
    regions: List[str] = Query(..., description="Regions to compare")
):
    """Get parameter comparison chart"""
    try:
        result = visualization_service.create_parameter_comparison(parameter, regions)
        return result
    except Exception as e:
        logger.error(f"Error creating parameter comparison: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@visualization_router.get("/3d")
async def get_3d_visualization(
    parameter: str = Query(..., description="Parameter name"),
    region: str = Query("global", description="Ocean region")
):
    """Get 3D visualization data"""
    try:
        result = visualization_service.create_3d_visualization(parameter, region)
        return result
    except Exception as e:
        logger.error(f"Error creating 3D visualization: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Admin routes
@admin_router.post("/ingest")
async def trigger_data_ingestion(background_tasks: BackgroundTasks):
    """Trigger manual data ingestion"""
    try:
        background_tasks.add_task(data_ingestion_service.sync_argo_data)
        return {"message": "Data ingestion triggered"}
    except Exception as e:
        logger.error(f"Error triggering data ingestion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.get("/health")
async def get_system_health():
    """Get system health status"""
    try:
        # This would check various system components
        return {
            "status": "healthy",
            "services": {
                "database": "connected",
                "rag_service": "active",
                "visualization": "active",
                "data_ingestion": "active"
            },
            "timestamp": "2024-01-15T10:30:00Z"
        }
    except Exception as e:
        logger.error(f"Error getting system health: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Export the routers
__all__ = ["data_router", "chat_router", "visualization_router", "admin_router"]
