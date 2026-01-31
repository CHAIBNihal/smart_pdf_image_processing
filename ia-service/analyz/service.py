# analyz/service.py
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from typing import List
import Entity.models as models
from Redis.service import redis_service 
from analyz.model import AnalyzBase


class AnalyzService:
    
    
    def create_analyz(self, analyz: AnalyzBase, db: Session) -> models.AnalyzHistory:
        try:
            db_analyz = models.AnalyzHistory(**analyz.dict())
            db.add(db_analyz)
            db.commit()
            db.refresh(db_analyz)
            return db_analyz
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur lors de la création de l'analyse: {str(e)}"
            )
    
    #Récupere un seul analyz fait 
    async def get_analyz_by_id(self, analyz_id: str, db: Session) :
        try:
            cache = await redis_service.get_cache_analyz(analyz_id=analyz_id)
            if cache is not  None :
                print('data cached =======>', cache) 
                return cache

            analyz = db.query(models.AnalyzHistory).options(
            joinedload(models.AnalyzHistory.chats)).filter(
                models.AnalyzHistory.id == analyz_id
            ).first()
            
            if analyz is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Analyse avec l'ID {analyz_id} introuvable"
                )
            # stocker cette analyz en redis : 
            await redis_service.cache_analyz(analyz=analyz)
            return analyz
        except HTTPException:
            raise
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur lors de la récupération de l'analyse: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur serveur: {str(e)}"
            )
    
    # Récuperer tous les analayz d'un client :
    async def get_all_analyz_by_client(self, client_id: str, db: Session) -> List[models.AnalyzHistory]:
        try:
            client_analyz = db.query(models.AnalyzHistory).filter(
                models.AnalyzHistory.clientId == client_id
            ).all()  # Utiliser .all() au lieu de .first() pour récupérer toutes les analyses
            
            if not client_analyz:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Aucune analyse trouvée pour le client {client_id}"
                )
            
            return client_analyz
        except HTTPException:
            raise
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur lors de la récupération des analyses: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur serveur: {str(e)}"
            )
   
   
    


analyz_service = AnalyzService()