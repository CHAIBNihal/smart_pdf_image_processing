export interface IChat{
    id:string;
    question: string;
    answer: string;
    analyz_history_id: string;
    created_at: string;
    updated_at: string;
}

export interface IChatResponse{
  task_id : string;
  analyz_id: string;
  status: "processing" | "failed" | "success";
  message? : string;
  result?:{
    question : string;
    answer:string;
    chat_id:string;
    
  }
  error?:string
}