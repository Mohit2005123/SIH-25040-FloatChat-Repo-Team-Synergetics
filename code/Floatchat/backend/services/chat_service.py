import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal
from models import ChatSession, ChatMessage, User
import uuid
import json

logger = logging.getLogger(__name__)

class ChatService:
    """Service for managing chat sessions and messages"""
    
    def __init__(self):
        self.session = SessionLocal()
    
    def create_chat_session(self, user_id: Optional[int] = None, title: Optional[str] = None) -> Dict[str, Any]:
        """Create a new chat session"""
        try:
            session_id = str(uuid.uuid4())
            
            chat_session = ChatSession(
                user_id=user_id,
                session_id=session_id,
                title=title or f"Chat Session {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                created_at=datetime.utcnow(),
                is_active=True
            )
            
            self.session.add(chat_session)
            self.session.commit()
            
            return {
                "session_id": session_id,
                "title": chat_session.title,
                "created_at": chat_session.created_at.isoformat(),
                "user_id": user_id
            }
            
        except Exception as e:
            logger.error(f"Error creating chat session: {e}")
            self.session.rollback()
            raise
    
    def get_chat_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get chat session by ID"""
        try:
            chat_session = self.session.query(ChatSession).filter(
                ChatSession.session_id == session_id
            ).first()
            
            if not chat_session:
                return None
            
            return {
                "session_id": chat_session.session_id,
                "title": chat_session.title,
                "created_at": chat_session.created_at.isoformat(),
                "updated_at": chat_session.updated_at.isoformat(),
                "is_active": chat_session.is_active,
                "query_count": chat_session.query_count,
                "last_query": chat_session.last_query,
                "user_id": chat_session.user_id
            }
            
        except Exception as e:
            logger.error(f"Error getting chat session: {e}")
            return None
    
    def get_user_sessions(self, user_id: int, limit: int = 20) -> List[Dict[str, Any]]:
        """Get chat sessions for a user"""
        try:
            sessions = self.session.query(ChatSession).filter(
                ChatSession.user_id == user_id,
                ChatSession.is_active == True
            ).order_by(ChatSession.updated_at.desc()).limit(limit).all()
            
            return [
                {
                    "session_id": session.session_id,
                    "title": session.title,
                    "created_at": session.created_at.isoformat(),
                    "updated_at": session.updated_at.isoformat(),
                    "query_count": session.query_count,
                    "last_query": session.last_query
                }
                for session in sessions
            ]
            
        except Exception as e:
            logger.error(f"Error getting user sessions: {e}")
            return []
    
    def add_message(self, session_id: str, message_type: str, content: str, 
                   metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Add a message to a chat session"""
        try:
            # Get or create session
            chat_session = self.session.query(ChatSession).filter(
                ChatSession.session_id == session_id
            ).first()
            
            if not chat_session:
                chat_session = ChatSession(
                    session_id=session_id,
                    title=f"Chat Session {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                    created_at=datetime.utcnow(),
                    is_active=True
                )
                self.session.add(chat_session)
            
            # Create message
            message = ChatMessage(
                session_id=session_id,
                message_type=message_type,
                content=content,
                timestamp=datetime.utcnow(),
                query_type=metadata.get('query_type') if metadata else None,
                data_points_returned=metadata.get('data_points') if metadata else None,
                visualization_type=metadata.get('visualization_type') if metadata else None,
                processing_time=metadata.get('processing_time') if metadata else None,
                confidence_score=metadata.get('confidence') if metadata else None
            )
            
            self.session.add(message)
            
            # Update session
            chat_session.updated_at = datetime.utcnow()
            if message_type == 'user':
                chat_session.query_count += 1
                chat_session.last_query = content[:200]  # Store first 200 chars
            
            self.session.commit()
            
            return {
                "message_id": message.id,
                "session_id": session_id,
                "message_type": message_type,
                "content": content,
                "timestamp": message.timestamp.isoformat(),
                "metadata": metadata
            }
            
        except Exception as e:
            logger.error(f"Error adding message: {e}")
            self.session.rollback()
            raise
    
    def get_session_messages(self, session_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get messages for a chat session"""
        try:
            messages = self.session.query(ChatMessage).filter(
                ChatMessage.session_id == session_id
            ).order_by(ChatMessage.timestamp.asc()).limit(limit).all()
            
            return [
                {
                    "message_id": message.id,
                    "message_type": message.message_type,
                    "content": message.content,
                    "timestamp": message.timestamp.isoformat(),
                    "query_type": message.query_type,
                    "data_points_returned": message.data_points_returned,
                    "visualization_type": message.visualization_type,
                    "processing_time": message.processing_time,
                    "confidence_score": message.confidence_score
                }
                for message in messages
            ]
            
        except Exception as e:
            logger.error(f"Error getting session messages: {e}")
            return []
    
    def update_session_title(self, session_id: str, title: str) -> bool:
        """Update chat session title"""
        try:
            chat_session = self.session.query(ChatSession).filter(
                ChatSession.session_id == session_id
            ).first()
            
            if not chat_session:
                return False
            
            chat_session.title = title
            chat_session.updated_at = datetime.utcnow()
            self.session.commit()
            
            return True
            
        except Exception as e:
            logger.error(f"Error updating session title: {e}")
            self.session.rollback()
            return False
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a chat session"""
        try:
            chat_session = self.session.query(ChatSession).filter(
                ChatSession.session_id == session_id
            ).first()
            
            if not chat_session:
                return False
            
            # Soft delete - mark as inactive
            chat_session.is_active = False
            chat_session.updated_at = datetime.utcnow()
            self.session.commit()
            
            return True
            
        except Exception as e:
            logger.error(f"Error deleting session: {e}")
            self.session.rollback()
            return False
    
    def get_session_statistics(self, session_id: str) -> Dict[str, Any]:
        """Get statistics for a chat session"""
        try:
            # Get session
            chat_session = self.session.query(ChatSession).filter(
                ChatSession.session_id == session_id
            ).first()
            
            if not chat_session:
                return {}
            
            # Get message counts
            total_messages = self.session.query(ChatMessage).filter(
                ChatMessage.session_id == session_id
            ).count()
            
            user_messages = self.session.query(ChatMessage).filter(
                ChatMessage.session_id == session_id,
                ChatMessage.message_type == 'user'
            ).count()
            
            assistant_messages = self.session.query(ChatMessage).filter(
                ChatMessage.session_id == session_id,
                ChatMessage.message_type == 'assistant'
            ).count()
            
            # Get average processing time
            avg_processing_time = self.session.query(ChatMessage).filter(
                ChatMessage.session_id == session_id,
                ChatMessage.processing_time.isnot(None)
            ).with_entities(
                self.session.func.avg(ChatMessage.processing_time)
            ).scalar() or 0
            
            # Get total data points returned
            total_data_points = self.session.query(ChatMessage).filter(
                ChatMessage.session_id == session_id,
                ChatMessage.data_points_returned.isnot(None)
            ).with_entities(
                self.session.func.sum(ChatMessage.data_points_returned)
            ).scalar() or 0
            
            return {
                "session_id": session_id,
                "total_messages": total_messages,
                "user_messages": user_messages,
                "assistant_messages": assistant_messages,
                "average_processing_time": float(avg_processing_time),
                "total_data_points": total_data_points,
                "session_duration": (chat_session.updated_at - chat_session.created_at).total_seconds(),
                "created_at": chat_session.created_at.isoformat(),
                "updated_at": chat_session.updated_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting session statistics: {e}")
            return {}
    
    def search_messages(self, query: str, user_id: Optional[int] = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Search messages across sessions"""
        try:
            # Build query
            db_query = self.session.query(ChatMessage).filter(
                ChatMessage.content.ilike(f"%{query}%")
            )
            
            if user_id:
                db_query = db_query.join(ChatSession).filter(
                    ChatSession.user_id == user_id
                )
            
            messages = db_query.order_by(ChatMessage.timestamp.desc()).limit(limit).all()
            
            return [
                {
                    "message_id": message.id,
                    "session_id": message.session_id,
                    "message_type": message.message_type,
                    "content": message.content,
                    "timestamp": message.timestamp.isoformat(),
                    "query_type": message.query_type
                }
                for message in messages
            ]
            
        except Exception as e:
            logger.error(f"Error searching messages: {e}")
            return []
    
    def get_popular_queries(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most popular queries across all sessions"""
        try:
            # Get query types and their counts
            query_stats = self.session.query(
                ChatMessage.query_type,
                self.session.func.count(ChatMessage.id).label('count')
            ).filter(
                ChatMessage.query_type.isnot(None),
                ChatMessage.message_type == 'user'
            ).group_by(ChatMessage.query_type).order_by(
                self.session.func.count(ChatMessage.id).desc()
            ).limit(limit).all()
            
            return [
                {
                    "query_type": stat.query_type,
                    "count": stat.count
                }
                for stat in query_stats
            ]
            
        except Exception as e:
            logger.error(f"Error getting popular queries: {e}")
            return []
    
    def __del__(self):
        """Cleanup on destruction"""
        if hasattr(self, 'session'):
            self.session.close()
