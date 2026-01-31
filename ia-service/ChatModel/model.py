
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
class ChatBase(BaseModel) : 
    question : str
    analyzId : str
    token : str
    uploadId : str
    
class ChatResponse(BaseModel):
    id: str
    question: Optional[str] = None
    answer: Optional[str]
    analyz_history_id: str
    created_at: datetime
    updated_at: datetime
    model_config = {
        "from_attributes": True  # Permet de convertir depuis SQLAlchemy
    }