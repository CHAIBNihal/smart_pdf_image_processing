from Celery.celery_app import celery_app
from helpers import pdf_extract
from Redis.service import redis_service
from externes_api.uploads.api import call_upload_by_id_sync
import Entity.models as models
from database.database import SessionLocal
from langchain_core.messages import HumanMessage, AIMessage
import uuid
import logging
import pytesseract
from fastapi import UploadFile, File, HTTPException
import shutil
import requests
from PIL import Image
from io import BytesIO
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
import platform

@celery_app.task(name="tasks.analyze_pdf", bind=True)
def analyze_pdf_task(self, chat_data: dict):
    """
    Tâche Celery pour analyser un PDF
    """
    logger.info("=" * 50)
    logger.info(f"TASK STARTED - ID: {self.request.id}")
    logger.info(f"Data received: {chat_data}")
    logger.info("=" * 50)
    
    db = None
    
    try:
        db = SessionLocal()
        logger.info("Database session created")
        
        upload_id = chat_data["uploadId"]
        token = chat_data["token"]
        question = chat_data["question"]
        analyz_id = chat_data.get("analyzId") or str(uuid.uuid4())
        
        # Étape 1: Récupération du fichier
        self.update_state(state='PROCESSING', meta={'status': 'Récupération du fichier...'})
        logger.info(f"Fetching upload_id: {upload_id}")
        
        resp_api = call_upload_by_id_sync(upload_id, token)
        
        if "error" in resp_api:
            logger.error(f"API Error: {resp_api['error']}")
            raise Exception(f"API call failed: {resp_api['error']} - {resp_api.get('details', '')}")
        
        logger.info(f"API response received")
        
        uploads_files = resp_api["data"]["uploadfile"]
        file_url = next(
            (f["file"] for f in uploads_files if f.get('isLast') is True), 
            None
        )
        
        if not file_url:
            logger.error("No file found for this uploadId")
            raise Exception("No file found for this uploadId")
        
        logger.info(f"File URL found: {file_url}")
        
        # Étape 2: Extraction du texte
        self.update_state(state='PROCESSING', meta={'status': 'Extraction du texte du PDF...'})
        logger.info("Starting PDF text extraction")
        raw_text = pdf_extract.extract_pdf(file_url)
        logger.info(f"Text extracted: {len(raw_text)} characters")
        
        # Étape 3: Découpage en chunks
        self.update_state(state='PROCESSING', meta={'status': 'Traitement du texte...'})
        logger.info("Creating text chunks")
        text_chunks = pdf_extract.get_text_chunks(raw_text)
        logger.info(f"Text chunks created: {len(text_chunks)} chunks")
        
        # Étape 4: Création du vectorstore
        self.update_state(state='PROCESSING', meta={'status': 'Création du vectorstore...'})
        logger.info("Creating vectorstore")
        vectorestores = pdf_extract.get_vectores(text_chunks)
        logger.info("Vectorstore created successfully")
        
        # Étape 5: Analyse avec la chaîne de conversation
        self.update_state(state='PROCESSING', meta={'status': 'Analyse en cours...'})
        logger.info("Creating conversation chain")
        chain, chat_history = pdf_extract.get_conversation_chain(vectorestores)
        logger.info("Conversation chain created")
        
        logger.info(f"Invoking chain with question: {question}")
        answer = chain.invoke({
            "question": question,
            "chat_history": []
        })
        logger.info(f"Answer generated successfully (length: {len(answer)} chars)")
        
        # Mise à jour de l'historique
        chat_history.append(HumanMessage(content=question))
        chat_history.append(AIMessage(content=answer))
        
        # Étape 6: Cache Redis (VERSION SYNCHRONE)
        self.update_state(state='PROCESSING', meta={'status': 'Sauvegarde du cache...'})
        try:
            #  VERSION SYNCHRONE
            cache = redis_service.createChat_sync(analyz_id)
            logger.info(f"Redis cache created: {cache is not None}")
        except Exception as redis_error:
            logger.warning(f"Redis cache failed but continuing: {redis_error}")
        
        # Étape 7: Sauvegarde en base de données
        self.update_state(state='PROCESSING', meta={'status': 'Sauvegarde en base de données...'})
        logger.info("Saving to database")
        
        db_chat = models.Chat(
            question=question,
            answer=answer,
            analyz_history_id=analyz_id
        )
        
        db.add(db_chat)
        db.commit()
        db.refresh(db_chat)
        logger.info(f"Chat saved to DB with ID: {db_chat.id}")
        
        chat_id = db_chat.id
        
        result = {
            "status": "success",
            "chat_id": chat_id,
            "analyz_id": analyz_id,
            "answer": answer,
            "question": question
        }
        
        logger.info("=" * 50)
        logger.info(f"TASK COMPLETED SUCCESSFULLY - ID: {self.request.id}")
        logger.info(f"Chat ID: {chat_id}, Analyz ID: {analyz_id}")
        logger.info("=" * 50)
        
        return result
        
    except Exception as e:
        logger.error("=" * 50)
        logger.error(f"TASK FAILED - ID: {self.request.id}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error message: {str(e)}")
        logger.error("=" * 50)
        logger.exception("Full traceback:")
        raise e
        
    finally:
        if db:
            try:
                db.close()
                logger.info("Database session closed")
            except Exception as e:
                logger.error(f"Error closing DB: {e}")


# Task pour extraire le text dpuis l'image : 
@celery_app.task(name="image_analyz", bind=True) 
def analyz_image(self, chat_data: dict) :
    """
    Tache Celery Pour analayser une image
    et extraire le text depuis cette image 
    """
    logger.info('=' * 50)
    logger.info(f"TASK STARTED - ID :", {self.request.id})
    logger.info(f"Data received : {chat_data}")
    logger.info("=" * 50)
    db = None
    try : 
        #Créer  une session pour la database : 
        db = SessionLocal()
        logger.info("Database Session Created ")
        # Specifier les données recu 
        upload_id = chat_data["uploadId"]
        token = chat_data["token"]
        question = chat_data["question"]
        analyz_id = chat_data.get("analyzId") or str(uuid.uuid4())
        
        #Etape 1 : Récuperation du fichier depuis l'api extener (nest js )
        self.update_state(state="PROCESSING", meta={"status" : " Récupération du fichier..."})
        logger.info(f"Fetching upload_id : {upload_id}")

        response_api = call_upload_by_id_sync(upload_id, token=token)

        if "error" in response_api : 
            logger.error(f"API Error : {response_api['error']}")
            raise Exception(f"API call failed: {response_api['error']} - {response_api.get('details', '')}")
        
        logger.info(f"Api response received")
        uploads_files = response_api["data"]["uploadfile"]
        file_url = next(
            (f["file"] for f in uploads_files if f.get("isLast") is True), 
            None
        )
        if not file_url : 
            logger.error('No file found for this uploadId')
            raise Exception('No file found for this uploadId')
        logger.info(f"File URL found : {file_url}")

         
        #  pointer vers tesseract.exe
        if platform.system() == "Windows":
            pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        else:
             pytesseract.pytesseract.tesseract_cmd = 'tesseract'
        #Etape 2 : Telecharger l'image deppuis url de file en uploadFile en repnse de api extene
        self.update_state(state="PROCESSING", meta={"status" : "Téléchargement de l'image..."})
        logger.info("Downloading image from Supabase...")
        response=requests.get(file_url, timeout=30)

        if response.status_code != 200 : 
          raise Exception("Impossible de télécharger l'image depuis Supabase")
        
        image = Image.open(BytesIO(response.content))
        logger.info("Image téléchargée avec succès")

        # Etape 3 : Extraction de texte OCR avec  Tesseract)
        self.update_state(state="PROCESSING", meta={"status" : " Extraction du Texte ==> (OCR)..."})
        extracted_text = pytesseract.image_to_string(
            image=image, 
            lang="eng"
        )
        logger.info("OCR terminé avec succès")
        logger.info(f"Texte extrait : {extracted_text[:300]}...")

        # ================== Invoke chat TODO AFTER ===================
        #  Création du vectorstore
        self.update_state(state='PROCESSING', meta={'status': 'Création du vectorstore...'})
        logger.info("==========Creating vectorstore=============")
        vectorestores = pdf_extract.get_vectores(extracted_text)
        logger.info("Vectorstore created successfully")
        
        #  Analyse avec la chaîne de conversation
        self.update_state(state='PROCESSING', meta={'status': 'Analyse en cours...'})
        logger.info("==========Creating conversation chain============")
        chain, chat_history = pdf_extract.get_conversation_chain(vectorestores)
        logger.info("Conversation chain created")
        
        logger.info(f"Invoking chain with question: {question}")
        answer = chain.invoke({
            "question": question,
            "chat_history": []
        })
        logger.info(f"Answer generated successfully  {answer} chars)")
        
        # Mise à jour de l'historique
        chat_history.append(HumanMessage(content=question))
        chat_history.append(AIMessage(content=answer))
        #=================End Invoke========================
        #  cacher la reponse en redis : 
        self.update_state(state='PROCESSING', meta={'status': 'Sauvegarde du cache...'})
        try:
            #  VERSION SYNCHRONE
            cache = redis_service.createChat_sync(analyz_id)
            logger.info(f"Redis cache created: {cache is not None}")
        except Exception as redis_error:
            logger.warning(f"Redis cache failed but continuing: {redis_error}")
        
        #  cacher la reponse en database 
        self.update_state(state='PROCESSING', meta={'status': 'Sauvegarde en base de données...'})
        logger.info("Saving to database")
        
        db_chat = models.Chat(
            question=question,
            answer=extracted_text,
            analyz_history_id=analyz_id
        )
        
        db.add(db_chat)
        db.commit()
        db.refresh(db_chat)
        logger.info(f"Chat saved to DB with ID: {db_chat.id}")
        
        chat_id = db_chat.id
        res = {
            "status" : "success", 
            "chat_id" : chat_id, 
            "answer" : answer,
            "analyz_id": analyz_id,
            "question" : question,
            "text" : extracted_text 
        }
        logger.info("=" * 50)
        logger.info(f"TASK COMPLETED SUCCESSFULLY - ID: {self.request.id}")
        logger.info(f"Chat ID: {chat_id}, Analyz ID: {analyz_id}")
        logger.info("=" * 50)
        return res
    except Exception as e :
        logger.error("=" * 50)
        logger.error(f"TASK FAILED - ID: {self.request.id}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error message: {str(e)}")
        logger.error("=" * 50)
        logger.exception("Full traceback:")
        raise e
    finally :
        if db : 
            try : 
                db.close()
                logger.info("DataBase session is Closed")
            except Exception as e : 
                logger.error(f"error closing database : {e}")
    