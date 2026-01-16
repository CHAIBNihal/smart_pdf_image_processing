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
    root_path="/api"  # IMPORTANT : FastAPI est servi sous /api via Nginx
)

# Configuration CORS - doit matcher avec votre frontend et Nginx
origins = [
    "http://localhost:3000",       # Si vous avez un dev server React/Next séparé
    "https://localhost:3000",      # HTTPS version for secure connections
    "http://localhost",
    "https://localhost",
    "http://127.0.0.1:3000",
    "https://127.0.0.1:3000",
    "http://127.0.0.1",
    "https://127.0.0.1",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    max_age=3600,  # Cache preflight requests for 1 hour
)

analyz_routes(app)
chat_routes(app)

@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API d'Analyse"}

@app.get("/health")
async def health():
    return {"status": "ok"}