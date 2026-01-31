from pydantic import BaseModel
from typing import Optional, List
from ChatModel.model import ChatBase, ChatResponse  # Importez les deux
from datetime import datetime
# Pour créer un Analyz (REQUEST)
class AnalyzBase(BaseModel):
    prompt: str
    clientId: str
    uploadId: str
    # created_at: datetime
    # updated_at: datetime

# Pour retourner un Analyz avec ses chats (RESPONSE)
class AnalyzResponse(BaseModel):
    id: str
    clientId: str
    uploadId: str
    prompt: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    chats: List[ChatResponse] = []  # Utilisez ChatResponse ici
    
    model_config = {
        "from_attributes": True
    }

class ClientAnalyseResponse(BaseModel): 
    id: str
    prompt: str
    clientId: str
    uploadId: str

    created_at: datetime
    updated_at: datetime