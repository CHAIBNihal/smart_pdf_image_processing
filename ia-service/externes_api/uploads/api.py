from core.http_client import async_client
from dotenv import load_dotenv
import os
from typing import Dict
import httpx

load_dotenv()

# VERSION ASYNCHRONE (existante) - pour FastAPI
async def call_upload_by_id(id: str, token: str) -> Dict:
    base_url = os.environ["UPLOAD_SERVICE"]
    url = f"{base_url}/uploads/upload/{id}"
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = await async_client.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {
            "error": f"Request failed with status {response.status_code}",
            "details": response.text
        }


# VERSION SYNCHRONE - pour Celery
def call_upload_by_id_sync(id: str, token: str) -> Dict:
    """
    Version synchrone pour les tâches Celery
    """
    base_url = os.environ.get("UPLOAD_SERVICE")
    
    if not base_url:
        raise ValueError("UPLOAD_SERVICE environment variable is not set")
    
    url = f"{base_url}/uploads/upload/{id}"
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        # Créer un client synchrone httpx
        with httpx.Client(timeout=30.0) as client:
            response = client.get(url, headers=headers)
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "error": f"Request failed with status {response.status_code}",
                    "details": response.text
                }
    except httpx.TimeoutException:
        return {
            "error": "Request timeout",
            "details": "The request took too long to complete"
        }
    except httpx.RequestError as e:
        return {
            "error": "Request error",
            "details": str(e)
        }
    except Exception as e:
        return {
            "error": "Unexpected error",
            "details": str(e)
        }