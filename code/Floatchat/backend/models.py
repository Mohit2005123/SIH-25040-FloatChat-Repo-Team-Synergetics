from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from datetime import datetime
from typing import Optional, Dict, Any

class FloatData(Base):
    """ARGO float data model"""
    __tablename__ = "float_data"
    
    id = Column(Integer, primary_key=True, index=True)
    float_id = Column(String(50), unique=True, index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    depth = Column(Float, nullable=False)
    temperature = Column(Float, nullable=True)
    salinity = Column(Float, nullable=True)
    pressure = Column(Float, nullable=True)
    oxygen = Column(Float, nullable=True)
    ph = Column(Float, nullable=True)
    chlorophyll = Column(Float, nullable=True)
    timestamp = Column(DateTime, nullable=False, default=func.now())
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Metadata
    platform_type = Column(String(50), default="ARGO")
    status = Column(String(20), default="active")
    battery_level = Column(Float, nullable=True)
    cycle_number = Column(Integer, nullable=True)
    data_quality = Column(String(20), default="good")
    
    # Relationships
    parameters = relationship("OceanParameter", back_populates="float_data")

class OceanParameter(Base):
    """Ocean parameter measurements model"""
    __tablename__ = "ocean_parameters"
    
    id = Column(Integer, primary_key=True, index=True)
    float_id = Column(String(50), ForeignKey("float_data.float_id"), nullable=False)
    parameter_name = Column(String(50), nullable=False)
    parameter_value = Column(Float, nullable=False)
    parameter_unit = Column(String(20), nullable=False)
    depth_level = Column(Float, nullable=False)
    measurement_time = Column(DateTime, nullable=False)
    quality_flag = Column(String(20), default="good")
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    float_data = relationship("FloatData", back_populates="parameters")

class User(Base):
    """User model for authentication and preferences"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    organization = Column(String(100), nullable=True)
    role = Column(String(20), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    last_login = Column(DateTime, nullable=True)
    
    # User preferences
    preferred_region = Column(String(50), default="global")
    preferred_parameters = Column(JSON, default=list)
    notification_settings = Column(JSON, default=dict)

class ChatSession(Base):
    """Chat session model for conversation history"""
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Session metadata
    query_count = Column(Integer, default=0)
    last_query = Column(Text, nullable=True)
    session_data = Column(JSON, default=dict)

class ChatMessage(Base):
    """Individual chat message model"""
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), ForeignKey("chat_sessions.session_id"), nullable=False)
    message_type = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=func.now())
    
    # Message metadata
    query_type = Column(String(50), nullable=True)
    data_points_returned = Column(Integer, nullable=True)
    visualization_type = Column(String(50), nullable=True)
    processing_time = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)

class DataExport(Base):
    """Data export request model"""
    __tablename__ = "data_exports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    export_type = Column(String(20), nullable=False)  # 'csv', 'netcdf', 'json'
    query_parameters = Column(JSON, nullable=False)
    file_path = Column(String(500), nullable=True)
    status = Column(String(20), default="pending")  # 'pending', 'processing', 'completed', 'failed'
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)
    file_size = Column(Integer, nullable=True)
    download_count = Column(Integer, default=0)

class SystemMetrics(Base):
    """System performance and usage metrics"""
    __tablename__ = "system_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String(20), nullable=True)
    timestamp = Column(DateTime, default=func.now())
    meta = Column(JSON, default=dict)

class DataSource(Base):
    """Data source configuration and status"""
    __tablename__ = "data_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(100), nullable=False)
    source_type = Column(String(50), nullable=False)  # 'argo', 'satellite', 'buoy'
    source_url = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime, nullable=True)
    sync_frequency = Column(Integer, default=3600)  # seconds
    data_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Source configuration
    api_key = Column(String(255), nullable=True)
    sync_settings = Column(JSON, default=dict)
    quality_threshold = Column(Float, default=0.8)
