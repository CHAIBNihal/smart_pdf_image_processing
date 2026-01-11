from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# Charger les variables d'environnement depuis .env
load_dotenv()

# Récupération de Url depuis env fichier 
URL_DB = os.getenv("DATABASE_URL")

if not URL_DB:
    raise ValueError("❌ DATABASE_URL n'est pas définie dans le fichier .env")

# Création de l'engine
engine = create_engine(URL_DB, echo=True)

# Test
print("✅ URL_DATABASE =", URL_DB)

# Session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base déclarative
Base = declarative_base()
