import http from "../http/analyzHttp"
import { type IChat, type IChatResponse } from "../../Interfaces/Chat"
import { type IAnalyseResponse, type IInitialAnalyse } from "../../Interfaces/Analyse";
const ANALYZ_ENDPOINT = "/analyz"
const CHAT_ENDP = "/chat"
// Récuperer tous les analyse de client
export const getAnalyseByClientId = async (clientId: string) : Promise <IAnalyseResponse[]>=>{
   return http.get(`${ANALYZ_ENDPOINT}/client/${clientId}`);
}

// créer un nouvelle analyse : 
export const createAnalyse = (uploadId:string, clientId : string, prompt : string) : Promise<IInitialAnalyse>=>{
   return http.post(`${ANALYZ_ENDPOINT}/`, {prompt, clientId, uploadId})
}

// Récuperer le single Analyse par leur id 

export const getSingleAnalyse = (id: string): Promise<IInitialAnalyse>=>{
   return http.get(`${ANALYZ_ENDPOINT}/${id}`);
}

export const chatPdf = (question: string, analyzId: string, token: string, uploadId: string): Promise<IChatResponse>=>{
   return http.post(`${CHAT_ENDP}/chat_pdf`, {question, analyzId, token, uploadId});
}

export const chatImage = (question: string, analyzId: string, token: string, uploadId: string): Promise<IChatResponse>=>{
   return http.post(`${CHAT_ENDP}/extract_image`, {question, analyzId, token, uploadId});
}

// chat Response task from Celery: 

export const ResultExtraction = (task_id: string): Promise<IChatResponse>=>{
   return http.get(`${CHAT_ENDP}/response_task/${task_id}`);
}

export const getChatDetails = (id: string): Promise<IChat>=>{
   return http.get(`${CHAT_ENDP}/chat/${id}`)
}
