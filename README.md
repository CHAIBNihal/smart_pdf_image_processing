🚀 Architecture Microservices - Plateforme Complète
📋 Vue d'Ensemble du Projet
Cette plateforme microservices offre une solution complète avec trois services principaux : authentification, traitement IA et paiements. Chaque service est conçu pour être indépendant, scalable et maintenable.

┌─────────────────────────────────────────────────────────────┐
│                   Microservices Architecture                │
├────────────────┬──────────────────┬─────────────────────────┤
│  Service Auth  │  Service IA      │  Service Paiement       │
│  (NestJS)      │  (FastAPI)       │  (Spring Boot)          │
├────────────────┼──────────────────┼─────────────────────────┤
│  Supabase      │  Celery          │  Stripe                 │
│  MySQL         │  Redis           │  Kafka                  │
│  Prisma        │  MySQL           │  MySQL                  │
│  S3 Storage    │  TensorFlow      │  Webhook                │
└────────────────┴──────────────────┴─────────────────────────┘

🏗️ Architecture Technique


🌐 Service d'Authentification + xportation des PDF ou Image (NestJS)
Port : 3333

Gestion des utilisateurs 

JWT tokens avec refresh mechanism

OAuth2 avec Supabase

Stockage S3 pour les fichiers utilisateurs
======================================================


🤖 Service IA (FastAPI)
Port : 8000

Traitement asynchrone avec Celery

File de messages Redis pour les tâches

Modèles de machine learning

API REST pour prédictions
======================================================


💰 Service Paiement (Spring Boot)
Port : 8080

Intégration Stripe complète

Événements Kafka pour synchronisation

Webhooks Stripe sécurisés

Gestion des abonnements


📁 Structure du Projet
├── auth-service/
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile
│   └── docker-compose.yml
├── ia-service/
│   ├── analyz/
    ├── celery/ 
    ├── ChatModel/
    ├── core/
│   ├── database/
    ├── Entity/
    ├── extrernes_api/
    ├── helpers/
    ├── Redis/
    ├── api.py
    ├──main.py
    ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
├── payment-service/
│   ├── src/main/java/
│   ├── Dockerfile
│   └── docker-compose.yml
├── nginx/
│   └── conf/nginx.conf
├── migration.sql
└── docker-compose.yml
======================================================

🚀 Démarrage Rapide

Prérequis
# Outils requis
- Docker & Docker Compose
- Node.js 24+ (pour auth)
- Python 3.14+ (pour IA)
- Java 21+ (pour paiement)
- Git

1. Cloner le projet
https://github.com/CHAIBNihal/smart_pdf_image_processing.git
cd smart_pdf_image_processing


2. Configuration de l'environnement
# .env ==> auth-service 
PORT = 3333
DATABASE_URL=mysql://user:password@mysql:3306/db_name?connection_limit=10&pool_timeout=30&connect_timeout=10
JWT_SECRET=your_secret_key_here

GOOGLE_CLIENT_ID= your_google_clientId
GOOGLE_SECRET=Yout_google_key 
#mettez ce lien en votre callback lien en configuration de votre Google cloud platform
GOOGLE_CALLBACK_URL=http://auth-service:3333/auth/google/callback


SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_secret_key
SUPABASE_STORAGE_BUCKET=your_s3_bucket_name



# .env ==> ia-service 
GROQ_API_KEY="your_LLM_model_key"
# Si vous travaillez localement si votre db sur docker mettez le nom de container de votre db ==> mysql+pymysql://user:password@mysql:3306/db_name
DATABASE_URL = mysql+pymysql://user:password@localhost:3306/db_name
HUGGINGFACEHUB_API_TOKEN=hugging_face_api_key

UPLOAD_SERVICE =http://auth-service:3333

# Si  vous etes sur docker sinon metter redis://localhsot:6379/
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

======================================================

3. Démarrer avec Docker 
# Lancer tous les services
docker-compose -f docker-compose.full.yml up -d

# Vérifier l'état
docker-compose ps
======================================================


4. Démarrer manuellement chaque service

Service Auth
cd auth-service
npm install
npx prisma migrate dev
npx prisma generate
npm run start:dev

Service IA
cd ia-service
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

Service Paiement
cd payment-service
./mvnw clean install
./mvnw spring-boot:run


5 - Commande  Zookeeper + Kafka  

docker run --name zookeeper `
  -p 2181:2181 `
  -e ZOOKEEPER_CLIENT_PORT=2181 `
  -e ZOOKEEPER_TICK_TIME=2000 `
  confluentinc/cp-zookeeper:7.5.0

docker run -d `
  --name kafka `
  -p 9092:9092 `
  -e KAFKA_BROKER_ID=1 `
  -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 `
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 `
  -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092 `
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 `
  --link zookeeper `
  confluentinc/cp-kafka:7.5.0


