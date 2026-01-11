from sqlalchemy import Boolean, Integer, Column, String, UUID, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database.database import Base

class AnalyzHistory(Base):
    __tablename__ = "analyz_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    clientId = Column(String(100), nullable=False)
    uploadId = Column(String(100), nullable=False)
    prompt = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # One-to-Many: un AnalyzHistory a plusieurs Chats
    chats = relationship("Chat", back_populates="analyz_history")

class Chat(Base):
    __tablename__ = "chat"  # corrigé
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    question = Column(String(1000), nullable=True)
    answer = Column(String(6000), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign key vers AnalyzHistory
    analyz_history_id = Column(String(36), ForeignKey("analyz_history.id"), nullable=False)
    # Relation Many-to-One: chaque chat appartient à un AnalyzHistory
    analyz_history = relationship("AnalyzHistory", back_populates="chats")
