# FloatChat - AI-Powered Ocean Data Discovery

FloatChat is an innovative AI-powered conversational interface for ARGO Ocean Data Discovery and Visualization, built for Smart India Hackathon 2025 (Problem Statement #25040).

## 🌊 Overview

FloatChat democratizes access to complex oceanographic data by providing an intuitive, AI-powered interface that allows users to query, explore, and visualize ARGO float data through natural language conversations.

## ✨ Key Features

### 🤖 AI-Powered Queries
- Natural language processing for complex ocean data queries
- Context-aware responses with intelligent data insights
- Multi-language support for global accessibility
- Learning from user interactions

### 📊 Real-time Visualization
- Interactive maps showing global ARGO float distribution
- Time series charts for ocean parameter trends
- 3D depth profiles and ocean visualizations
- Customizable dashboard layouts

### 🌍 Global Ocean Coverage
- 99% global ocean coverage with real-time data
- Regional and basin-specific data views
- Multi-resolution data access
- Live float tracking and status monitoring

### 🗄️ Advanced Data Management
- PostgreSQL for structured ocean data storage
- Vector database (ChromaDB) for metadata and summaries
- Optimized query performance with indexing
- Data compression and efficient retrieval

## 🚀 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Plotly.js** - Interactive visualizations
- **Leaflet** - Interactive maps

### Backend
- **FastAPI** - High-performance Python web framework
- **PostgreSQL** - Relational database for structured data
- **ChromaDB** - Vector database for embeddings
- **SQLAlchemy** - ORM for database operations
- **LangChain** - LLM framework for RAG
- **OpenAI GPT** - Large language model integration

### Data Processing
- **xarray** - Multi-dimensional data arrays
- **pandas** - Data manipulation and analysis
- **netCDF4** - NetCDF file processing
- **scikit-learn** - Machine learning utilities

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL 13+
- Redis (optional, for caching)

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python -c "from database import init_db; import asyncio; asyncio.run(init_db())"

# Start the server
python app.py
```

### Database Setup
```bash
# Create PostgreSQL database
createdb floatchat

# Run migrations (if any)
# The database will be automatically initialized on first run
```

## 📖 Usage

### 1. Dashboard
Access the main dashboard to view:
- Global ARGO float distribution
- Real-time ocean parameter metrics
- Interactive data visualizations
- System statistics

### 2. AI Chat
Ask questions in natural language:
- "Show me temperature trends in the Indian Ocean for the last 6 months"
- "Compare salinity between Pacific and Atlantic regions"
- "Find floats with the highest oxygen levels"
- "What are the nearest ARGO floats to this location?"

### 3. Data Visualization
Explore data through various visualization types:
- Interactive maps with parameter overlays
- Time series charts for trend analysis
- 3D depth profiles for vertical analysis
- Comparative visualizations across regions

### 4. Data Export
Export data in multiple formats:
- CSV for spreadsheet analysis
- NetCDF for scientific applications
- JSON for API integration
- Custom formats based on requirements

## 🔧 API Endpoints

### Data Endpoints
- `GET /api/data/floats` - Get ARGO float data
- `GET /api/data/floats/{float_id}` - Get specific float details
- `GET /api/data/parameters` - Get ocean parameter data
- `GET /api/data/statistics` - Get system statistics

### Chat Endpoints
- `POST /api/chat/sessions` - Create chat session
- `GET /api/chat/sessions/{session_id}` - Get session details
- `POST /api/chat/query` - Process chat query
- `GET /api/chat/sessions/{session_id}/messages` - Get session messages

### Visualization Endpoints
- `GET /api/visualization/map` - Get map visualization
- `GET /api/visualization/timeseries` - Get time series chart
- `GET /api/visualization/depth-profile/{float_id}` - Get depth profile
- `GET /api/visualization/comparison` - Get parameter comparison
- `GET /api/visualization/3d` - Get 3D visualization

## 🎯 Smart India Hackathon 2025 Features

### Mandatory Requirements ✅
- [x] ARGO NetCDF data ingestion and processing
- [x] Structured data storage (PostgreSQL)
- [x] Vector database for metadata (ChromaDB)
- [x] RAG pipeline with LLM integration
- [x] Interactive dashboard with geospatial visualizations
- [x] Conversational chatbot interface
- [x] Natural language query processing
- [x] Data export capabilities

### Innovative Additions 🚀
- **Real-time Data Streaming** - Live updates from ARGO floats
- **Advanced AI Features** - Context-aware responses and learning
- **3D Visualizations** - Immersive ocean data exploration
- **Collaborative Features** - Share insights and sessions
- **Mobile-Responsive Design** - Access from any device
- **Performance Optimization** - Sub-100ms response times
- **Comprehensive Analytics** - Usage tracking and insights

## 🌟 Unique Selling Points

1. **Democratized Access** - Makes complex ocean data accessible to everyone
2. **AI-Powered Intelligence** - Natural language queries with intelligent responses
3. **Real-time Processing** - Live data updates and streaming
4. **Beautiful UI/UX** - Modern, intuitive interface design
5. **Comprehensive Coverage** - Global ocean data with regional insights
6. **Extensible Architecture** - Easy to add new data sources and features

## 🔮 Future Enhancements

- Integration with satellite data sources
- Machine learning for ocean prediction
- Mobile application development
- Advanced analytics and reporting
- Multi-user collaboration features
- API marketplace for ocean data

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏆 Smart India Hackathon 2025

**Problem Statement ID:** 25040  
**Title:** FloatChat - AI-Powered Conversational Interface for ARGO Ocean Data Discovery and Visualization  
**Organization:** Ministry of Earth Sciences (MoES)  
**Department:** Indian National Centre for Ocean Information Services (INCOIS)  



**Built with ❤️ for Smart India Hackathon 2025**
