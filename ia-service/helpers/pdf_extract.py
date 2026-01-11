from dotenv import load_dotenv
load_dotenv()
from fastapi import HTTPException
import requests
from pypdf import PdfReader
from io import BytesIO
from langchain_text_splitters import CharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_groq import ChatGroq
from langchain_core.runnables import RunnableLambda
# ------------------etapes de analyser le pdf ---------------
# etape 1 : extraire et recuperer le text depuis le pdf 
def extract_pdf(pdf_url: str) -> str:
    headr = {"User-Agent" : "Mozilla/5.0"}
    #print("pdf est ",pdf_url)
    response = requests.get(pdf_url, headers=headr, timeout=15)
    
    if response.status_code != 200: 
        raise HTTPException(
            status_code=400,
            detail=f'Failed to receive the pdf: {response.status_code}'
        )
    
    pdf_bytes = BytesIO(response.content)
    reader = PdfReader(pdf_bytes)
    
    #print("pages ======>", len(reader.pages))
    
    text = ""
    for page in reader.pages: 
        text += page.extract_text() + "\n"
    
    #print('pdf extrait est=====> ', text[:100])
    return text


# etape 2 : (split text) ==> couper le text en petit chunks 
def get_text_chunks(raw: str) -> list[str]: 
    text_splitter = CharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        separator="\n"
    )
    chunks = text_splitter.split_text(raw)
    return chunks


# etape 3 : créer embeddings pour vectors
def get_vectores(text_chunks): 
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vectorestore = FAISS.from_texts(texts=text_chunks, embedding=embeddings)
    vectorestore.save_local('faiss_index')
    return vectorestore


def load_vectorstore():
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    return FAISS.load_local(
        "faiss_index",
        embeddings,
        allow_dangerous_deserialization=True
    )


# etape 4 : recuperer la conversation depuis embedding depuis le vectore Store en chain (VERSION MODERNE)
def get_conversation_chain(vectorstore):
    # definir le model LM qui va nous repondre sur ce sui est retriever 
    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        temperature=0
    )
    
    # Pour chaque question tu chercher les chunks plus proches sematiquement 
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    # Definir le prompt : 
    prompt = ChatPromptTemplate.from_messages([
        ("system", """Vous êtes un assistant qui répond aux questions basées sur le contexte fourni.
        Utilisez les informations suivantes pour répondre à la question.
        Si vous ne trouvez pas la réponse dans le contexte, dites-le clairement.
        
        Contexte: {context}"""),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{question}")
    ])
    
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)
    
    
    
    chain = (
        {
            "context": RunnableLambda(lambda x : x["question"]) | retriever | format_docs,
            "question": RunnableLambda(lambda x : x["question"]),
            "chat_history":RunnableLambda(lambda x: x.get("chat_history", []))
        }
        | prompt
        | llm
        | StrOutputParser()
        
    )
    
    return chain, []


# Fonction pour utiliser la chaîne avec historique
def ask_question(chain, chat_history, question: str):
    # Créer le dictionnaire d'entrée avec l'historique
    response = chain.invoke({
        "question": question,
        "chat_history": chat_history
    })
    
    # Mettre à jour l'historique
    chat_history.extend([
        HumanMessage(content=question),
        AIMessage(content=response)
    ])
    
    return response, chat_history