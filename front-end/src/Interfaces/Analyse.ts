import type { IChat } from "./Chat";
export interface IAnalyseResponse{
    prompt : string;
    created_at : string;
    uploadId: string;
    updated_at : string;
}
export interface IInitialAnalyse {
    id: string;
    clientId : string;
    prompt: string;
    uploadId:string
    created_at: string;
    updated_at: string;
    chats: IChat[]

}