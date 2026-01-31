import React, { useCallback, useEffect, useState } from 'react'
import Layout from '../Layout/Layout'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { chatImage, chatPdf, getSingleAnalyse } from '../../api/services/analyseService'
import { getUploadById } from '../../api/services/uploadService'
import { AuthStore } from '../../Store/auth/AuthStore'
// Types pour une meilleure typage
interface UploadFile {
  id: string;
  upload_id: string;
  file: string;
  isLast: boolean;
}

interface UploadResponse {
  data: {
    uploadfile: UploadFile[];
  };
}

const Chating = () => {
  const [searchParams] = useSearchParams()
  const token = AuthStore.getState().token;
  const [question, setQuestion] = useState('')
  const [uploadid, setUploadid] = useState("")
  const [Isloading, setIsLoading] = useState(false)
  const [typeFile, setTypeFile] = useState<"images" | "documents">('documents')
  const [error, setError] = useState("")
  const [fileUrl, setFileUrl] = useState<string>("")
  const { id } = useParams()
  const name = searchParams.get('name')
  const navigate = useNavigate();
  // Fonction pour déterminer le type de fichier
  const determineFileType = (url: string): "images" | "documents" => {
    try {
      // Extraire le chemin après "uploads/"
      const pathAfterUploads = url.split('uploads/')[1]
      
      if (!pathAfterUploads) {
        return 'documents' // Par défaut
      }

      // Vérifier si le chemin contient "images"
      if (pathAfterUploads.includes('images/')) {
        return 'images'
      }

      // Vérifier l'extension du fichier
      const fileExtension = url.split('.').pop()?.toLowerCase()
      
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
      const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx']

      if (fileExtension && imageExtensions.includes(fileExtension)) {
        return 'images'
      }

      if (fileExtension && documentExtensions.includes(fileExtension)) {
        return 'documents'
      }

      // Vérifier par pattern dans l'URL
      if (url.includes('/images/') || url.includes('image/') || url.includes('picture')) {
        return 'images'
      }

      return 'documents' // Par défaut
    } catch (error) {
      console.error("Erreur lors de la détermination du type:", error)
      return 'documents'
    }
  }

  const fetchAnalyseById = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")
      
      if (!id) {
        setError("ID manquant")
        return
      }

      const response = await getSingleAnalyse(id)
      
      if (!response) {
        setError("Récupération de données échouée. Réessayer plus tard!")
        return
      }

      if (response && response.uploadId) {
        const upload: UploadResponse = await getUploadById(response.uploadId)
        
        if (upload?.data?.uploadfile) {
          // Trouver le fichier avec isLast = true
          const lastFile = upload.data.uploadfile.find(f => f.isLast)
          
          if (lastFile) {
            setFileUrl(lastFile.file)
            
            // Déterminer le type de fichier
            const detectedType = determineFileType(lastFile.file)
            setTypeFile(detectedType)
            
            console.log(`Type détecté: ${detectedType}`)
            console.log(`URL du fichier: ${lastFile.file}`)
            
            // Optionnel: Stocker l'upload ID si nécessaire
            setUploadid(response.uploadId)
          } else {
            setError("Aucun fichier trouvé")
          }
        } else {
          setError("Aucun fichier uploadé trouvé")
        }
      } else {
        setError("Analyse sans fichier uploadé")
      }
    } catch (error) {
      console.error("Erreur complète:", error)
      setError(`Erreur serveur : ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchAnalyseById()
  }, [fetchAnalyseById])

  // Fonction pour afficher le fichier selon son type
  const renderFilePreview = () => {
    if (!fileUrl) return null

    switch (typeFile) {
      case 'images':
        return (
          <div className="mt-4">
            <img 
              src={fileUrl} 
              alt="Image uploadée" 
              className="max-w-full h-auto rounded-lg shadow-lg max-h-80"
              onError={(e) => {
                console.error("Erreur de chargement de l'image")
                e.currentTarget.style.display = 'none'
              }}
            />
            <p className="text-sm text-gray-500 mt-2">Type: Image</p>
          </div>
        )
      
      case 'documents':
        return (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Document</p>
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  Voir le document
                </a>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  const Handlesubmit = async()=>{
    try {
        if(!id) return;
        if(!token) return;
        const resp = typeFile === "documents" ? await chatPdf(question, id, token, uploadid) :
        await chatImage(question, id, token, uploadid); 
        if(!resp){
            setError('Extraction du text est échouée!')
        }
        navigate(`/task-result/${resp.task_id}`)

    } catch (error) {
        
    }
  }

  return (
    <Layout title='Demander au IA'>
      <section className="p-4 md:p-6">
        {Isloading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            <p className="font-medium">Erreur</p>
            <p>{error}</p>
            <button 
              onClick={fetchAnalyseById}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            {/* En-tête */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Analyse : {name || "Sans nom"}
              </h1>
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${typeFile === 'images' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'}`}>
                  Type: {typeFile === 'images' ? 'Image' : 'Document'}
                </div>
                {uploadid && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {uploadid.substring(0, 8)}...
                  </div>
                )}
              </div>
            </div>

            {/* Aperçu du fichier */}
            {fileUrl && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Fichier chargé
                </h2>
                {renderFilePreview()}
              </div>
            )}

            {/* Section de chat (à compléter) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Posez votre question sur le contenu
              </h2>
              <div className="space-y-4">
                <textarea 
                value={question}
                onChange={(e)=> setQuestion(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                  rows={4}
                  placeholder={`Posez une question sur ce ${typeFile === 'images' ? 'image' : 'document'}...`}
                />
                <button
                onClick={Handlesubmit}
                 className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Envoyer la question
                </button>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <p>L'IA analysera le contenu du fichier pour répondre à vos questions.</p>
            </div>
          </>
        )}
      </section>
    </Layout>
  )
}

export default Chating