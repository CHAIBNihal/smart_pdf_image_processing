from fastapi import HTTPException, status
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from ChatModel.model import ChatBase, ChatResponse
from Celery.task import analyze_pdf_task, analyz_image
from celery.result import AsyncResult
from Celery.celery_app import celery_app
from Entity import Chat
import uuid

load_dotenv()

class ChatModelService:
   
    async def chating(self, chat: ChatBase):
        """
        Lance l'analyse PDF de manière asynchrone via Celery
        """
        # Préparer les données pour Celery
        chat_data = {
            "uploadId": chat.uploadId,
            "token": chat.token,
            "question": chat.question,
            "analyzId": chat.analyzId or str(uuid.uuid4())
        }
        
        # Lanch Celery Task
        task = analyze_pdf_task.delay(chat_data)
        
        return {
            "task_id": task.id,
            "analyz_id": chat_data["analyzId"],
            "status": "processing",
            "message": "L'analyse du PDF est en cours"
        }
    
    async def get_task_status(self, task_id: str):
        """
        Récupérer le statut d'une tâche Celery
        """
        task_result = AsyncResult(task_id, app=celery_app)
        
        if task_result.state == 'PENDING':
            response = {
                "task_id": task_id,
                "status": "pending",
                "message": "La tâche est en attente"
            }
        elif task_result.state == 'PROCESSING':
            response = {
                "task_id": task_id,
                "status": "processing",
                "message": task_result.info.get('status', 'En cours...') if task_result.info else 'En cours...'
            }
        elif task_result.state == 'SUCCESS':
            response = {
                "task_id": task_id,
                "status": "success",
                "result": task_result.result
            }
        else:  # FAILURE ou autre
            response = {
                "task_id": task_id,
                "status": "failed",
                "error": str(task_result.info)
            }
        
        return response

    async def extarct_text_from_image(self, chat: ChatBase) : 
        """
        Lance l'analyse l'image  de manière asynchrone via Celery
        """
        # Préparer les données pour Celery
        chat_data = {
            "uploadId": chat.uploadId,
            "token": chat.token,
            "question": chat.question,
            "analyzId": chat.analyzId or str(uuid.uuid4())
        }
        task = analyz_image.delay(chat_data)
        return {
            "task_id": task.id,
            "analyz_id": chat_data["analyzId"],
            "status": "processing",
            "message": "L'analyse du PDF est en cours"
        }
   
   
    async def get_chat(self, id:str, db : Session):
        chat = db.get(Chat, id)
        if chat is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Chat avec ID {id} non trouvé"
            )
        return ChatResponse.model_validate(chat)
chat_service = ChatModelService()