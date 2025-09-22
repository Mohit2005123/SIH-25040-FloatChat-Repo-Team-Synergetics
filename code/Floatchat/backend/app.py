from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv
from pathlib import Path
import asyncio
from contextlib import asynccontextmanager

from database import init_db, get_db
from models import FloatData, OceanParameter
from services.data_ingestion import DataIngestionService
from services.rag_service import RAGService
from services.visualization_service import VisualizationService
from services.chat_service import ChatService
from api import routes as routes_module
from utils.logger import setup_logger
from database import SessionLocal
from models import FloatData
from datetime import datetime, timedelta
import random

# Load environment variables (root .env and backend/.env)
load_dotenv()
try:
    load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")
except Exception:
    pass

# Setup logging
logger = setup_logger(__name__)

# Global services
data_ingestion_service = None
rag_service = None
visualization_service = None
chat_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events"""
    global data_ingestion_service, rag_service, visualization_service, chat_service
    
    # Startup
    logger.info("Starting FloatChat backend services...")
    
    try:
        # Initialize database
        await init_db()
        logger.info("Database initialized successfully")
        
        # Initialize services
        data_ingestion_service = DataIngestionService()
        rag_service = RAGService()
        visualization_service = VisualizationService()
        chat_service = ChatService()
        
        # Start background data ingestion
        asyncio.create_task(data_ingestion_service.start_background_ingestion())
        logger.info("Background data ingestion started")
        
        # Initialize RAG service
        await rag_service.initialize()
        logger.info("RAG service initialized")

        # Expose initialized services to API routes module
        try:
            routes_module.data_ingestion_service = data_ingestion_service
            routes_module.rag_service = rag_service
            routes_module.visualization_service = visualization_service
            routes_module.chat_service = chat_service
            logger.info("Injected services into API routes module")
        except Exception as e:
            logger.warning(f"Failed to inject services into routes: {e}")

        # Seed demo data if database is empty
        try:
            db = SessionLocal()
            count = db.query(FloatData).count()
            if count == 0:
                logger.info("Seeding demo ARGO float data (SQLite dev)...")
                base_date = datetime(2023, 3, 1)
                rows = []
                # 60 equatorial floats in March 2023
                for i in range(60):
                    lat = random.uniform(-4.5, 4.5)
                    lon = random.uniform(-180, 180)
                    ts = base_date + timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
                    rows.append(FloatData(
                        float_id=f"EQ_{i+1:04d}",
                        latitude=lat,
                        longitude=lon,
                        depth=random.uniform(200, 2000),
                        temperature=round(24 + random.uniform(-2, 3), 2),
                        salinity=round(35 + random.uniform(-1, 1), 3),
                        pressure=None,
                        oxygen=None,
                        ph=None,
                        chlorophyll=None,
                        timestamp=ts,
                        status='active',
                        data_quality='good'
                    ))
                # 40 non-equatorial recent floats
                now = datetime.utcnow()
                for i in range(40):
                    lat = random.uniform(-60, 60)
                    if -5 < lat < 5:
                        lat = 10 if lat >= 0 else -10
                    lon = random.uniform(-180, 180)
                    ts = now - timedelta(days=random.randint(0, 90))
                    rows.append(FloatData(
                        float_id=f"GL_{i+1:04d}",
                        latitude=lat,
                        longitude=lon,
                        depth=random.uniform(200, 2000),
                        temperature=round(18 + random.uniform(-5, 8), 2),
                        salinity=round(34.5 + random.uniform(-1.2, 1.2), 3),
                        pressure=None,
                        oxygen=None,
                        ph=None,
                        chlorophyll=None,
                        timestamp=ts,
                        status='active',
                        data_quality='good'
                    ))
                db.add_all(rows)
                db.commit()
                logger.info("Demo data seeded.")
            db.close()
        except Exception as e:
            logger.warning(f"Seeding skipped/failed: {e}")
        
        logger.info("All services started successfully")
        
    except Exception as e:
        logger.error(f"Failed to start services: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down FloatChat backend services...")
    if data_ingestion_service:
        await data_ingestion_service.stop_background_ingestion()
    logger.info("Shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="FloatChat API",
    description="AI-Powered Ocean Data Discovery and Visualization API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(routes_module.data_router, prefix="/api/data", tags=["data"])
app.include_router(routes_module.chat_router, prefix="/api/chat", tags=["chat"])
app.include_router(routes_module.visualization_router, prefix="/api/visualization", tags=["visualization"])
app.include_router(routes_module.admin_router, prefix="/api/admin", tags=["admin"])

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "FloatChat API",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to FloatChat API",
        "description": "AI-Powered Ocean Data Discovery and Visualization",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
