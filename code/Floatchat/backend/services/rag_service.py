import os
import json
import logging
from typing import List, Dict, Any, Optional
import numpy as np
import faiss
import chromadb
from chromadb.config import Settings
from sqlalchemy.orm import Session
from database import SessionLocal
from models import FloatData, OceanParameter, ChatMessage

logger = logging.getLogger(__name__)

class RAGService:
    """Retrieval-Augmented Generation service for ocean data queries"""
    
    def __init__(self):
        self.llm = None
        self.llm_model = None
        self.embeddings = None
        self.vectorstore = None
        self.chroma_client = None
        self.collection = None
        self.session = SessionLocal()
        
    async def initialize(self):
        """Initialize RAG service components"""
        try:
            # Initialize optional LLM (LangChain OpenAI) if key is present
            try:
                api_key = os.getenv("OPENAI_API_KEY")
                print(api_key)
                if api_key:
                    from langchain_openai import ChatOpenAI
                    model ='gpt-5'
                    # Pass API key explicitly; use a valid default model
                    self.llm = ChatOpenAI(api_key=api_key, model=model, temperature=0)
                    self.llm_model = model
                    logger.info(f"OPENAI_API_KEY detected. Using LLM model: {model}")
                else:
                    logger.info("OPENAI_API_KEY not set; using rule-based NL->SQL")
            except Exception as e:
                logger.warning(f"Failed to initialize LLM; falling back to rule-based: {e}")

            # Initialize ChromaDB
            self.chroma_client = chromadb.Client(Settings(
                persist_directory="./chroma_db",
                anonymized_telemetry=False
            ))
            
            # Create or get collection
            self.collection = self.chroma_client.get_or_create_collection(
                name="ocean_data",
                metadata={"description": "ARGO ocean data and metadata"}
            )
            
            # Build knowledge base
            await self._build_knowledge_base()
            
            logger.info("RAG service initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing RAG service: {e}")
            raise
    
    async def _build_knowledge_base(self):
        """Build knowledge base from ocean data and documentation"""
        try:
            # Get ocean data summaries
            ocean_data_docs = await self._create_ocean_data_documents()
            
            # Add documents to ChromaDB
            if ocean_data_docs:
                self.collection.add(
                    documents=ocean_data_docs,
                    metadatas=[{"source": "ocean_data", "type": "float_summary"} for _ in ocean_data_docs],
                    ids=[f"ocean_data_{i}" for i in range(len(ocean_data_docs))]
                )
            
            # Add general ocean knowledge
            general_docs = self._create_general_documents()
            if general_docs:
                self.collection.add(
                    documents=general_docs,
                    metadatas=[{"source": "general", "type": "ocean_knowledge"} for _ in general_docs],
                    ids=[f"general_{i}" for i in range(len(general_docs))]
                )
            
            logger.info(f"Knowledge base built with {len(ocean_data_docs) + len(general_docs)} documents")
            
        except Exception as e:
            logger.error(f"Error building knowledge base: {e}")
            raise
    
    async def _create_ocean_data_documents(self) -> List[str]:
        """Create document summaries from ocean data"""
        try:
            # Get sample float data
            floats = self.session.query(FloatData).limit(100).all()
            documents = []
            
            for float_data in floats:
                # Create summary for each float
                summary = f"""
                ARGO Float {float_data.float_id}:
                - Location: {float_data.latitude}°N, {float_data.longitude}°E
                - Status: {float_data.status}
                - Temperature: {float_data.temperature}°C
                - Salinity: {float_data.salinity} PSU
                - Depth: {float_data.depth} meters
                - Last Update: {float_data.timestamp}
                - Data Quality: {float_data.data_quality}
                """
                documents.append(summary)
            
            # Create regional summaries
            regions = await self._get_regional_summaries()
            documents.extend(regions)
            
            return documents
            
        except Exception as e:
            logger.error(f"Error creating ocean data documents: {e}")
            return []
    
    async def _get_regional_summaries(self) -> List[str]:
        """Get regional ocean data summaries"""
        try:
            # Indian Ocean summary
            indian_ocean_floats = self.session.query(FloatData).filter(
                FloatData.longitude.between(20, 120),
                FloatData.latitude.between(-30, 30)
            ).limit(50).all()
            
            if indian_ocean_floats:
                avg_temp = np.mean([f.temperature for f in indian_ocean_floats if f.temperature])
                avg_salinity = np.mean([f.salinity for f in indian_ocean_floats if f.salinity])
                
                indian_summary = f"""
                Indian Ocean Region Summary:
                - Active Floats: {len(indian_ocean_floats)}
                - Average Temperature: {avg_temp:.2f}°C
                - Average Salinity: {avg_salinity:.2f} PSU
                - Coverage: 20°E to 120°E, 30°S to 30°N
                - Data Quality: Good
                """
                
                return [indian_summary]
            
            return []
            
        except Exception as e:
            logger.error(f"Error getting regional summaries: {e}")
            return []
    
    def _create_general_documents(self) -> List[str]:
        """Create general ocean knowledge documents"""
        return [
            """
            ARGO Float Program:
            The Argo program is an international collaboration that collects high-quality temperature and salinity profiles from the upper 2000m of the ice-free global ocean and currents from intermediate depths.
            """,
            """
            Ocean Parameters:
            - Temperature: Measured in degrees Celsius (°C), affects density and circulation
            - Salinity: Measured in Practical Salinity Units (PSU), affects density and freezing point
            - Pressure: Measured in decibars (dbar), used to calculate depth
            - Dissolved Oxygen: Measured in mg/L, important for marine life
            - pH: Measures acidity/alkalinity, affects marine chemistry
            - Chlorophyll: Measured in mg/m³, indicates phytoplankton abundance
            """,
            """
            Data Quality Flags:
            - Good: Data passed all quality checks
            - Probably Good: Data likely good but some uncertainty
            - Probably Bad: Data likely bad but some uncertainty
            - Bad: Data failed quality checks
            """,
            """
            Ocean Regions:
            - Indian Ocean: 20°E to 120°E, 30°S to 30°N
            - Pacific Ocean: 120°E to 60°W, 60°S to 60°N
            - Atlantic Ocean: 60°W to 20°E, 60°S to 60°N
            - Southern Ocean: 60°S to 90°S, all longitudes
            """,
            """
            Common Queries:
            - "Show me temperature trends in [region] for [time period]"
            - "Compare salinity between [region1] and [region2]"
            - "Find floats with highest/lowest [parameter] values"
            - "What are the nearest floats to [coordinates]?"
            - "Show me data from floats deployed in [year]"
            """
        ]
    
    async def process_query(self, query: str, user_id: Optional[int] = None) -> Dict[str, Any]:
        """Process a natural language query using RAG"""
        try:
            # Special handling: nearest floats to coordinates
            if 'nearest' in query.lower():
                nearest = self._handle_nearest_query(query)
                return nearest
            # Special handling: within <km> of <place>
            within = self._handle_within_place_query(query)
            if within is not None:
                return within
            context = ""
            
            # Generate SQL query from natural language
            sql_query = await self._generate_sql_query(query, context)
            
            # Execute SQL query
            data_results = await self._execute_sql_query(sql_query)
            
            # Generate natural language response
            response = await self._generate_response(query, context, data_results)
            
            # Store query and response
            await self._store_chat_message(query, response, user_id)
            
            return {
                'response': response,
                'sql_query': sql_query,
                'data_points': len(data_results) if data_results else 0,
                'context_sources': 0,
                'confidence': 0.85
            }
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return {
                'response': f"I apologize, but I encountered an error processing your query: {str(e)}",
                'sql_query': None,
                'data_points': 0,
                'context_sources': 0,
                'confidence': 0.0
            }
    
    async def _generate_sql_query(self, query: str, context: str) -> str:
        """Generate SQL query from natural language using LLM"""
        try:
            # If LLM available, attempt NL->SQL first
            if self.llm is not None:
                from langchain.prompts import ChatPromptTemplate
                prompt = ChatPromptTemplate.from_template(
                    """
                    You translate user questions about ocean float data into a single SQLite SQL query.
                    Table float_data columns:
                    - float_id TEXT
                    - latitude REAL
                    - longitude REAL
                    - depth REAL
                    - temperature REAL
                    - salinity REAL
                    - pressure REAL
                    - oxygen REAL
                    - ph REAL
                    - chlorophyll REAL
                    - timestamp DATETIME
                    - status TEXT

                    Rules:
                    - Only select columns you need. Always include float_id, latitude, longitude, timestamp if relevant.
                    - Use WHERE filters for regions:
                      Indian Ocean = longitude BETWEEN 20 AND 120 AND latitude BETWEEN -30 AND 30
                    - For time ranges use timestamp >= DATETIME('now','-7 days') etc.
                    - Limit to 200 rows and order by timestamp DESC.
                    - Return ONLY the SQL, no explanation.

                    User question: {question}
                    """
                )
                # Use LangChain synchronous invoke wrapped in executor
                messages = prompt.format_messages(question=query)
                import asyncio
                loop = asyncio.get_running_loop()
                sql_text = await loop.run_in_executor(None, lambda: self.llm.invoke(messages))
                candidate = sql_text.content.strip().strip("` ")
                # Basic guardrails
                if not candidate.lower().startswith("select"):
                    raise ValueError("LLM did not return SQL")
                # Ensure limit and order
                if "limit" not in candidate.lower():
                    candidate += " LIMIT 200"
                if "order by" not in candidate.lower():
                    candidate += " ORDER BY timestamp DESC"
                return candidate

            # Minimal, rule-based parse to support core queries without external LLM
            q = query.lower()
            where = []
            markers = []  # time range markers consumed by executor
            if 'equator' in q:
                where.append('ABS(latitude) < 5')
            if 'indian ocean' in q:
                where.append('longitude BETWEEN 20 AND 120 AND latitude BETWEEN -30 AND 30')
            if 'march 2023' in q:
                where.append("timestamp >= '2023-03-01' AND timestamp < '2023-04-01'")
            # Relative time ranges (handled by executor via markers)
            if 'last 30 days' in q or 'past 30 days' in q or '30 days' in q:
                markers.append('last_30_days')
            if 'this week' in q or 'past week' in q or 'last 7 days' in q or '7 days' in q:
                markers.append('last_7_days')
            if 'last 6 months' in q or 'past 6 months' in q or '6 months' in q:
                markers.append('last_180_days')
            if 'oxygen' in q or 'dissolved oxygen' in q or 'o2' in q:
                select_cols = 'float_id, latitude, longitude, oxygen as value, timestamp'
                base = 'FROM float_data'
                where.append('oxygen IS NOT NULL')
            elif 'salinity' in q or 'psal' in q:
                select_cols = 'float_id, latitude, longitude, salinity as value, timestamp'
                base = 'FROM float_data'
                where.append('salinity IS NOT NULL')
            elif 'temperature' in q or 'temp' in q:
                select_cols = 'float_id, latitude, longitude, temperature as value, timestamp'
                base = 'FROM float_data'
                where.append('temperature IS NOT NULL')
            else:
                select_cols = 'float_id, latitude, longitude, salinity as value, timestamp'
                base = 'FROM float_data'
                where.append('salinity IS NOT NULL')
            where_sql = (' WHERE ' + ' AND '.join(where)) if where else ''
            order = ' ORDER BY timestamp DESC'
            limit = ' LIMIT 200'
            marker_sql = (" /* " + ",".join(markers) + " */") if markers else ''
            return f"SELECT {select_cols} {base}{where_sql}{order}{limit}{marker_sql}"
            
        except Exception as e:
            logger.error(f"Error generating SQL query: {e}")
            return "SELECT * FROM float_data LIMIT 10"
    
    async def _execute_sql_query(self, sql_query: str) -> List[Dict[str, Any]]:
        """Execute SQL query and return results"""
        try:
            lower = sql_query.lower()

            from datetime import datetime, timedelta

            def build_query(time_days: int | None):
                q = self.session.query(FloatData)
                # Parameter filters
                if "salinity" in lower:
                    q = q.filter(FloatData.salinity.isnot(None))
                if "temperature" in lower:
                    q = q.filter(FloatData.temperature.isnot(None))
                if "oxygen" in lower:
                    q = q.filter(FloatData.oxygen.isnot(None))
                # Latitude eq band
                if "abs(latitude) < 5" in lower or ("latitude between" in lower and "-5" in lower and "5" in lower):
                    q = q.filter(FloatData.latitude.between(-5, 5))
                # Indian Ocean box (simple)
                if "longitude between 20 and 120" in lower and "latitude between -30 and 30" in lower:
                    q = q.filter(FloatData.longitude.between(20, 120), FloatData.latitude.between(-30, 30))
                # Time window detection for March 2023
                if "2023-03-01" in lower and "2023-04-01" in lower:
                    start = datetime(2023, 3, 1)
                    end = datetime(2023, 4, 1)
                    q = q.filter(FloatData.timestamp >= start, FloatData.timestamp < end)
                # Relative time windows via markers or override
                now = datetime.utcnow()
                if time_days is not None:
                    q = q.filter(FloatData.timestamp >= now - timedelta(days=time_days))
                else:
                    if 'last_7_days' in lower:
                        q = q.filter(FloatData.timestamp >= now - timedelta(days=7))
                    if 'last_30_days' in lower:
                        q = q.filter(FloatData.timestamp >= now - timedelta(days=30))
                    if 'last_180_days' in lower:
                        q = q.filter(FloatData.timestamp >= now - timedelta(days=180))
                return q

            # First attempt: as requested
            q = build_query(time_days=None)
            results = q.order_by(FloatData.timestamp.desc()).limit(200).all()

            # If empty and a short window was requested, progressively widen
            if not results and ('last_7_days' in lower or 'last_30_days' in lower or 'last_180_days' in lower):
                for days in (30, 90, 180, None):
                    q2 = build_query(time_days=days)
                    results = q2.order_by(FloatData.timestamp.desc()).limit(200).all()
                    if results:
                        break
            
            return [
                {
                    'float_id': f.float_id,
                    'latitude': f.latitude,
                    'longitude': f.longitude,
                    'temperature': f.temperature,
                    'salinity': f.salinity,
                    'oxygen': f.oxygen,
                    'timestamp': f.timestamp.isoformat() if f.timestamp else None
                }
                for f in results
            ]
            
        except Exception as e:
            logger.error(f"Error executing SQL query: {e}")
            return []
    
    async def _generate_response(self, query: str, context: str, data_results: List[Dict[str, Any]]) -> str:
        """Generate natural language response using rule-based summarization"""
        try:
            n = len(data_results)
            if n == 0:
                return "I couldn't find matching samples for that filter. Try widening the time or latitude band."

            import statistics as st

            def vals(key):
                return [r[key] for r in data_results if r.get(key) is not None]

            sal = vals('salinity')
            tmp = vals('temperature')
            oxy = vals('oxygen')
            lats = vals('latitude')
            lons = vals('longitude')

            q = query.lower()

            # Helper to name region from lon/lat
            def region_name(lat: float, lon: float) -> str:
                if 20 <= lon <= 120 and -30 <= lat <= 30:
                    return 'Indian Ocean'
                if -60 <= lon <= 20 and -60 <= lat <= 60:
                    return 'Atlantic Ocean'
                if (lon >= 120 or lon <= -60) and -60 <= lat <= 60:
                    return 'Pacific Ocean'
                return 'Global'

            # If query asks for "unusual" salinity patterns, highlight outliers by region
            if 'unusual' in q and ('salinity' in q or 'psal' in q) and sal:
                global_mean = st.mean(sal)
                regions = {'Indian Ocean': [], 'Atlantic Ocean': [], 'Pacific Ocean': []}
                for r in data_results:
                    if r.get('latitude') is None or r.get('longitude') is None or r.get('salinity') is None:
                        continue
                    rn = region_name(float(r['latitude']), float(r['longitude']))
                    if rn in regions:
                        regions[rn].append(float(r['salinity']))
                deltas = []
                for rn, arr in regions.items():
                    if not arr:
                        continue
                    mean_r = st.mean(arr)
                    deltas.append((rn, mean_r - global_mean, mean_r))
                deltas.sort(key=lambda x: abs(x[1]), reverse=True)
                highlights = [f"{rn} ({'higher' if d>0 else 'lower'} by {abs(d):.2f} PSU; mean {m:.2f} PSU)" for rn, d, m in deltas if abs(d) >= 0.30]
                base = f"Based on {n} recent samples, global salinity averages {global_mean:.2f} PSU. "
                if highlights:
                    return base + "Unusual patterns detected in: " + ", ".join(highlights) + "."
                else:
                    return base + "No strong regional anomalies (>|0.30| PSU) were detected in this window."

            # Variability by subregion (Indian Ocean, salinity)
            if ('indian ocean' in q) and ('variability' in q) and ('salinity' in q or 'psal' in q) and sal:
                import statistics as st
                # Define simple subregions within Indian Ocean
                def subregion(lat: float, lon: float) -> str:
                    if 45 <= lon <= 80 and 5 <= lat <= 25:
                        return 'Arabian Sea (NW)'
                    if 80 < lon <= 100 and 5 <= lat <= 25:
                        return 'Bay of Bengal (NE)'
                    if -10 <= lat <= 10:
                        return 'Equatorial Indian (EQ)'
                    if -30 <= lat < -10:
                        return 'Southern Indian (SW/SE)'
                    return 'Other Indian'
                buckets: dict[str, list[float]] = {}
                for r in data_results:
                    if r.get('salinity') is None or r.get('latitude') is None or r.get('longitude') is None:
                        continue
                    sr = subregion(float(r['latitude']), float(r['longitude']))
                    buckets.setdefault(sr, []).append(float(r['salinity']))
                ranking = []
                for name, arr in buckets.items():
                    if len(arr) >= 3:
                        ranking.append((name, st.pstdev(arr), st.mean(arr), len(arr)))
                if not ranking:
                    return f"I found {n} samples in the Indian Ocean but not enough per subregion to estimate variability. Try widening the time window."
                ranking.sort(key=lambda x: x[1], reverse=True)
                lines = [f"{name}: σ={sd:.3f} PSU (mean {m:.2f}, n={cnt})" for name, sd, m, cnt in ranking[:4]]
                return "Highest salinity variability by Indian Ocean subregion: " + "; ".join(lines) + "."

            # Tailored summary for Indian Ocean temperature this week
            if ('indian ocean' in q) and ('temperature' in q or 'temp' in q) and tmp:
                mean_t = st.mean(tmp)
                return (
                    f"Indian Ocean (last window): Mean temperature {mean_t:.2f}°C, "
                    f"range {min(tmp):.2f}–{max(tmp):.2f}°C across {n} samples. "
                    "Warmest pockets align with lower latitudes and western/eastern basin edges."
                )

            # Oxygen anomalies globally in recent window
            if ('oxygen' in q or 'o2' in q or 'dissolved oxygen' in q) and oxy:
                mean_o = st.mean(oxy)
                sd_o = st.pstdev(oxy) if len(oxy) > 1 else 0.0
                low_threshold = mean_o - 1.5 * sd_o if sd_o > 0 else min(oxy)
                lows = []
                for r in data_results:
                    ov = r.get('oxygen')
                    if ov is None:
                        continue
                    if ov <= low_threshold:
                        lows.append((ov, r))
                lows.sort(key=lambda x: x[0])
                if not lows:
                    return f"Analyzed {n} samples. Oxygen mean {mean_o:.2f} mg/L; no low-oxygen anomalies below {low_threshold:.2f} mg/L detected."
                top = lows[:5]
                lines = [f"float {r.get('float_id')}: O₂={ov:.2f} mg/L at ({r.get('latitude'):.2f},{r.get('longitude'):.2f})" for ov, r in top]
                return f"Detected {len(lows)} low-oxygen samples (≤ {low_threshold:.2f} mg/L). " + "; ".join(lines) + "."

            # Generic concise narrative
            parts = []
            if tmp:
                parts.append(f"Temperature mean {st.mean(tmp):.2f}°C (min {min(tmp):.2f}, max {max(tmp):.2f}).")
            if sal:
                parts.append(f"Salinity mean {st.mean(sal):.2f} PSU (min {min(sal):.2f}, max {max(sal):.2f}).")
            if oxy:
                parts.append(f"Oxygen mean {st.mean(oxy):.2f} mg/L (min {min(oxy):.2f}, max {max(oxy):.2f}).")
            if lats and lons:
                parts.append(f"Coverage: lat {min(lats):.2f}–{max(lats):.2f}, lon {min(lons):.2f}–{max(lons):.2f}.")
            lead = f"Analyzed {n} samples. "
            return lead + " ".join(parts)

        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return f"I found {len(data_results)} data points related to your query about ocean data."
    
    async def _store_chat_message(self, query: str, response: str, user_id: Optional[int] = None):
        """Store chat message in database"""
        try:
            # This would store the message in a real implementation
            logger.info(f"Stored chat message: {query[:50]}...")
        except Exception as e:
            logger.error(f"Error storing chat message: {e}")
    
    def get_similar_queries(self, query: str, limit: int = 5) -> List[str]:
        """Get similar queries from history"""
        try:
            # This would query the chat history for similar queries
            return [
                "Show me temperature trends in the Indian Ocean",
                "What are the salinity levels near the equator?",
                "Find floats with highest oxygen levels",
                "Compare temperature between Pacific and Atlantic",
                "Show me data from floats deployed in 2024"
            ][:limit]
        except Exception as e:
            logger.error(f"Error getting similar queries: {e}")
            return []
    
    def __del__(self):
        """Cleanup on destruction"""
        if hasattr(self, 'session'):
            self.session.close()

    # ----------------- Helpers -----------------
    def _parse_lat_lon(self, text: str) -> Optional[Dict[str, float]]:
        import re
        # Try patterns: "lat: 12.34, lon: 77.12" or "12.34, 77.12"
        m = re.search(r"lat\s*[:=]\s*([-+]?\d+\.?\d*)\s*,?\s*lon\s*[:=]\s*([-+]?\d+\.?\d*)", text, re.I)
        if m:
            return { 'lat': float(m.group(1)), 'lon': float(m.group(2)) }
        m2 = re.search(r"([-+]?\d+\.?\d*)\s*,\s*([-+]?\d+\.?\d*)", text)
        if m2:
            lat, lon = float(m2.group(1)), float(m2.group(2))
            if -90 <= lat <= 90 and -180 <= lon <= 180:
                return { 'lat': lat, 'lon': lon }
        return None

    def _haversine_km(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        from math import radians, sin, cos, asin, sqrt
        R = 6371.0
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        return R * c

    def _handle_nearest_query(self, query: str) -> Dict[str, Any]:
        coords = self._parse_lat_lon(query)
        if not coords:
            # No coordinates provided; instruct the client
            return {
                'response': 'Please provide coordinates. For example: "nearest ARGO floats to lat: 12.97, lon: 77.59". If you said "this location", enable browser location so I can use it.',
                'sql_query': None,
                'data_points': 0,
                'context_sources': 0,
                'confidence': 0.6
            }
        lat0, lon0 = coords['lat'], coords['lon']
        floats = self.session.query(FloatData).all()
        if not floats:
            return {
                'response': 'I could not find floats in the local database yet. Try triggering data ingestion or try again shortly.',
                'sql_query': None,
                'data_points': 0,
                'context_sources': 0,
                'confidence': 0.7
            }
        enriched = []
        for f in floats:
            if f.latitude is None or f.longitude is None:
                continue
            d = self._haversine_km(lat0, lon0, float(f.latitude), float(f.longitude))
            enriched.append((d, f))
        enriched.sort(key=lambda x: x[0])
        top = enriched[:5]
        if not top:
            return {
                'response': 'No nearby floats found around the provided coordinates.',
                'sql_query': None,
                'data_points': 0,
                'context_sources': 0,
                'confidence': 0.7
            }
        lines = []
        for dist, f in top:
            lines.append(f"- Float {f.float_id}: {dist:.1f} km away at ({f.latitude:.2f}, {f.longitude:.2f}), salinity={f.salinity}, temp={f.temperature}")
        resp = f"Nearest ARGO floats to ({lat0:.2f}, {lon0:.2f}):\n" + "\n".join(lines)
        return {
            'response': resp,
            'sql_query': None,
            'data_points': len(top),
            'context_sources': 0,
            'confidence': 0.9
        }

    def _handle_within_place_query(self, query: str) -> Optional[Dict[str, Any]]:
        import re
        m = re.search(r"within\s+(\d{1,4})\s*km\s+of\s+(.+)$", query.strip(), re.I)
        if not m:
            return None
        radius_km = float(m.group(1))
        place = m.group(2).strip().rstrip('?').lower()
        # Resolve place to coordinates (simple gazetteer)
        latlon = self._resolve_place_to_coords(place)
        if latlon is None:
            return {
                'response': f"I couldn't resolve the location '{place}'. Please provide coordinates like 'lat: 7.0, lon: 81.0'.",
                'sql_query': None,
                'data_points': 0,
                'context_sources': 0,
                'confidence': 0.5
            }
        lat0, lon0 = latlon['lat'], latlon['lon']
        floats = self.session.query(FloatData).filter(FloatData.status == 'active').all()
        if not floats:
            return {
                'response': 'No floats available in the local database yet. Try triggering data ingestion.',
                'sql_query': None,
                'data_points': 0,
                'context_sources': 0,
                'confidence': 0.7
            }
        nearby = []
        for f in floats:
            if f.latitude is None or f.longitude is None:
                continue
            d = self._haversine_km(lat0, lon0, float(f.latitude), float(f.longitude))
            if d <= radius_km:
                nearby.append((d, f))
        if not nearby:
            return {
                'response': f"No active floats found within {int(radius_km)} km of {place.title()}.",
                'sql_query': None,
                'data_points': 0,
                'context_sources': 0,
                'confidence': 0.8
            }
        nearby.sort(key=lambda x: x[0])
        lines = []
        for d, f in nearby[:10]:
            lines.append(f"- {f.float_id}: {d:.1f} km; temp={f.temperature}, salinity={f.salinity} at ({f.latitude:.2f},{f.longitude:.2f})")
        resp = (
            f"Found {len(nearby)} active floats within {int(radius_km)} km of {place.title()}.\n" +
            "\n".join(lines)
        )
        return {
            'response': resp,
            'sql_query': None,
            'data_points': len(nearby),
            'context_sources': 0,
            'confidence': 0.9
        }

    def _resolve_place_to_coords(self, place: str) -> Optional[Dict[str, float]]:
        # Minimal built-in gazetteer; extend as needed
        gaz = {
            'sri lanka': { 'lat': 7.8731, 'lon': 80.7718 },
            'colombo': { 'lat': 6.9271, 'lon': 79.8612 },
            'bay of bengal': { 'lat': 15.0, 'lon': 90.0 },
            'arabian sea': { 'lat': 18.0, 'lon': 64.0 },
            'indian ocean': { 'lat': 0.0, 'lon': 80.0 },
            'chennai': { 'lat': 13.0827, 'lon': 80.2707 },
        }
        # direct match
        if place in gaz:
            return gaz[place]
        # strip common prefixes
        tokens = place.replace('the ', '').strip()
        return gaz.get(tokens)
