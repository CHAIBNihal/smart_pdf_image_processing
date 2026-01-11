from fastapi import FastAPI
from api import analyz_routes, chat_routes  # Import absolu (sans le point)
from database.database import engine
import Entity.models as models
import os
from dotenv import load_dotenv
load_dotenv()
# Créer les tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API d'Analyse",
    description="API pour gérer les analyses clients",
    version="1.0.0"
)

analyz_routes(app)
chat_routes(app)
@app.get("/")
async def root():
    
    return {"message": "Bienvenue sur l'API d'Analyse"}