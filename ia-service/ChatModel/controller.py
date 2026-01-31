from fastapi import Depends, status, APIRouter
from sqlalchemy.orm import Session
from database.database import SessionLocal
from typing import Annotated
from ChatModel.service import chat_service
from ChatModel.model import ChatBase, ChatResponse

def get_db() : 
    db  = SessionLocal()
    try : 
        yield db 
    finally : 
        db.close()



router = APIRouter(
    prefix="/chat", 
    tags=["chat"]
)

@router.post('/chat_pdf', status_code=status.HTTP_201_CREATED) 
async def chating(chat : ChatBase) : 
    res = await chat_service.chating(chat=chat)
    return res
@router.post("/extract_image", status_code=status.HTTP_201_CREATED)
async def extraction(chat : ChatBase) : 
    res = await chat_service.extarct_text_from_image(chat=chat)
    return res
@router.get("/chat/{id}", response_model=ChatResponse)
async def get_chat_details(id:str, db: Annotated[Session, Depends(get_db)]):
    resp = await chat_service.get_chat(id=id, db=db) 
    return resp
#===============================================
@router.get("/response_task/{task_id}")
async def get_analysis_status(task_id: str):
    """Récupère le statut de l'analyse"""
    status = await chat_service.get_task_status(task_id)
    return status