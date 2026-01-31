from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import analyz_routes, chat_routes
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
    version="1.0.0",
    # root_path="/api"  # IMPORTANT : FastAPI est servi sous /api via Nginx
)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "User-Agent",
        "DNT",
        "Cache-Control",
        "X-Requested-With",
        "If-Modified-Since",
        "Range",
    ],
    expose_headers=["Content-Length", "Content-Range"],
    max_age=3600,  
)

analyz_routes(app)
chat_routes(app)

@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API d'Analyse"}

@app.get("/health")
async def health():
    return {"status": "ok"}