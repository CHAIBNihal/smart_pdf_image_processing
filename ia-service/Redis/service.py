import redis
from redis import asyncio as aioredis
from typing import Optional
import logging
from Entity.models import AnalyzHistory
import json
logger = logging.getLogger(__name__)

class RedisService:
    def __init__(self):
        # Client synchrone pour Celery
        self.sync_client = redis.Redis(
            host='redis',
            port=6379,
            db=0,
            decode_responses=True
        )
        
        # Client async pour FastAPI (existant)
        self.async_client = None
    
    async def get_async_client(self):
        """Obtenir le client async pour FastAPI"""
        if self.async_client is None:
            self.async_client = await aioredis.from_url(
                "redis://redis:6379/0",
                decode_responses=True
            )
        return self.async_client
    
    # VERSION SYNCHRONE pour Celery sans async ==>
    def createChat_sync(self, session_id: str) -> Optional[str]:
        """
        Version synchrone pour Celery
        Crée ou récupère une session de chat dans Redis
        """
        try:
            key = f"chat:{session_id}"
            
            # Vérifier si la clé existe
            exists = self.sync_client.exists(key)
            
            if exists:
                logger.info(f"Chat session exists: {key}")
                value = self.sync_client.get(key)
                return value
            else:
                # Créer une nouvelle session
                logger.info(f"Creating new chat session: {key}")
                self.sync_client.set(key, session_id, ex=86400)  # Expire après 24h
                return session_id
                
        except redis.ConnectionError as e:
            logger.error(f"Redis connection error: {e}")
            return None
        except Exception as e:
            logger.error(f"Redis error: {e}")
            return None
    
    # VERSION ASYNCHRONE pour FastAPI avec async ===>
    async def createChat(self, session_id: str) -> Optional[str]:
        """
        Version asynchrone pour FastAPI
        """
        try:
            rd = await self.get_async_client()
            key = f"chat:{session_id}"
            
            # Vérifier si la clé existe
            value = await rd.get(key)
            
            if value:
                logger.info(f"Chat session exists: {key}")
                return value
            else:
                # Créer une nouvelle session
                logger.info(f"Creating new chat session: {key}")
                await rd.set(key, session_id, ex=86400)  # Expire après 24h
                return session_id
                
        except Exception as e:
            logger.error(f"Redis error: {e}")
            return None
        
  
  #Formater le analyz response de db en json 
    def analyz_to_dict(self, analyz):
      return {
          "id": analyz.id,
          "clientId": analyz.clientId,
          "uploadId": analyz.uploadId,
          "prompt": analyz.prompt,
          "created_at": analyz.created_at.isoformat(),
          "updated_at": analyz.updated_at.isoformat(),
          "chats": [
             {
                "id": chat.id,
                "question": chat.question,
                "answer": chat.answer,
                "analyz_history_id": chat.analyz_history_id,
                "created_at": chat.created_at.isoformat(),
                "updated_at": chat.updated_at.isoformat(),
             }
            for chat in analyz.chats
        ]
      }


   
    async def cache_analyz(self, analyz: AnalyzHistory):
     rd = await self.get_async_client()
     key = f"analyz:{analyz.id}"
     data = self.analyz_to_dict(analyz)
     await rd.set(key, json.dumps(data), ex=60 * 60 * 24)


    async def get_cache_analyz(self, analyz_id):
      rd = await self.get_async_client()
      key = f"analyz:{analyz_id}"
      data = await rd.get(key)
      if data is None:
        return None
      return json.loads(data)


redis_service = RedisService()