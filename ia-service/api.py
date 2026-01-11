from analyz.controller import router as analyz_router 
from ChatModel.controller import router as chat_router
from fastapi import FastAPI

# definir les routes selon les domaines fait  : 

def analyz_routes(app: FastAPI):
    app.include_router(analyz_router)

    
def chat_routes(app: FastAPI) : 
    app.include_router(chat_router)