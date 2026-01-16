import http from "../http/analyzHttp"
import { type IAnalyseResponse } from "../../Interfaces/Analyse";
const ANALYZ_ENDPOINT = "/analyz"

export const getAnalyseByClientId = async (clientId: string) : Promise <IAnalyseResponse[]>=>{
   return http.get(`${ANALYZ_ENDPOINT}/client/${clientId}`);
}


