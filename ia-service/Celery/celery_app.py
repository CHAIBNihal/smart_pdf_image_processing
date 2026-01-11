from celery import Celery
import os
from dotenv import load_dotenv
load_dotenv()

broker_url = os.getenv("CELERY_BROKER_URL")
backend_url = os.getenv("CELERY_RESULT_BACKEND")


celery_app = Celery(
    "pdf_analyzer",
    broker=broker_url,
    backend=backend_url,
    include=['Celery.task']
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_time_limit=600,
    # Important pour Docker
    broker_connection_retry_on_startup=True,
)

print(f"Celery broker: {celery_app.conf.broker_url}")
print(f"Celery backend: {celery_app.conf.result_backend}")