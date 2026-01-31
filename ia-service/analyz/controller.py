# analyz/controller.py
from fastapi import Depends, status, APIRouter
from sqlalchemy.orm import Session
from typing import Annotated, List

from analyz.model import AnalyzBase, AnalyzResponse, ClientAnalyseResponse
from analyz.service import analyz_service
from database.database import SessionLocal



# Dépendance pour la base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]

# Router pour les endpoints d'analyse
router = APIRouter(
    prefix="/analyz",
    tags=["analyz"]
)




@router.post("/", status_code=status.HTTP_201_CREATED, response_model=AnalyzResponse)
async def create_analyz(analyz: AnalyzBase, db: db_dependency):
  
    return analyz_service.create_analyz(analyz=analyz, db=db)


@router.get("/{analyz_id}", status_code=status.HTTP_200_OK, response_model=AnalyzResponse)
async def get_single_analyz(analyz_id: str, db: db_dependency):
    return await analyz_service.get_analyz_by_id(analyz_id=analyz_id, db=db)


@router.get("/client/{client_id}", status_code=status.HTTP_200_OK, response_model=List[ClientAnalyseResponse])
async def get_all_analyz(client_id: str, db: db_dependency):

    return await analyz_service.get_all_analyz_by_client(client_id=client_id, db=db)

