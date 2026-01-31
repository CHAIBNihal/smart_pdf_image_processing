import { useState, useEffect, useCallback, useRef } from 'react'
import Layout from '../Layout/Layout'
import { useParams, useNavigate } from 'react-router-dom'
import { getChatDetails, ResultExtraction } from '../../api/services/analyseService'
import { motion, AnimatePresence } from 'framer-motion'

interface ExtractionResult {
  task_id: string
  status: 'processing' | 'success' | 'failed'
  message?: string
  error?: string
  result?: {
    status: string
    chat_id: string
    analyz_id: string
    answer: string
    question: string
  }
  analyz_id?: string
}

const ResponseExtraction = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState<string>("")
  const [message, setMessage] = useState("Initialisation...")
  const [error, setError] = useState("")
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')
  const [progress, setProgress] = useState(0)
  const [taskId, setTaskId] = useState<string>("")
  
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 20 // Max 20 tentatives = 60 secondes

  // Fonction pour récupérer le résultat
  const getAnswer = useCallback(async (): Promise<ExtractionResult | null> => {
    try {
      if (!id) {
        setError("ID manquant")
        return null
      }

      const response = await ResultExtraction(id)
      
      if (!response) {
        throw new Error("Aucune réponse du serveur")
      }

      return response as ExtractionResult
      
    } catch (error) {
      console.error("Erreur lors de la récupération:", error)
      setError(`Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      return null
    }
  }, [id])

  // Fonction pour démarrer le polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    retryCountRef.current = 0
    setStatus('processing')
    setProgress(0)

    pollingIntervalRef.current = setInterval(async () => {
      retryCountRef.current += 1
      
      
      setProgress(prev => Math.min(prev + 5, 95))
      
      const response = await getAnswer()
      
      if (!response) {
        if (retryCountRef.current >= maxRetries) {
          stopPolling()
          setStatus('failed')
          setError("Délai d'attente dépassé. Veuillez réessayer.")
        }
        return
      }

      // Mettre à jour le taskId si disponible
      if (response.task_id) {
        setTaskId(response.task_id)
      }

      switch (response.status) {
        case 'processing':
          setMessage(response.message || "Traitement en cours...")
          setStatus('processing')
          break

        case 'success':
          if (response.result?.answer) {
            const chat_details =await getChatDetails(response.result.chat_id);
            if(!chat_details){
                console.error("No Chat Founded");
                setError("Chat est introuvable!")
            }
            setResult(chat_details.answer)
            setStatus('success')
            setMessage("Extraction terminée avec succès!")
            setProgress(100)
            stopPolling()
          }
          break

        case 'failed':
          setStatus('failed')
          setError(response.error || response.message || "Erreur lors de l'extraction")
          setMessage(`Échec: ${response.error || 'Erreur inconnue'}`)
          stopPolling()
          break

        default:
          if (retryCountRef.current >= maxRetries) {
            setStatus('failed')
            setError("Délai d'attente dépassé")
            stopPolling()
          }
      }
    }, 3000) // Polling toutes les 3 secondes

    // Premier appel immédiat
    getAnswer().then(initialResponse => {
      if (initialResponse?.status === 'success' && initialResponse.result?.answer) {
        setResult(initialResponse.result.answer)
        setStatus('success')
        setMessage("Extraction déjà terminée")
        stopPolling()
      }
    })
  }, [getAnswer])

  // Fonction pour arrêter le polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  // Gestion des messages selon le statut
  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return message || "Analyse en cours..."
      case 'success':
        return "✓ Extraction terminée avec succès"
      case 'failed':
        return "✗ Échec de l'extraction"
      default:
        return "En attente..."
    }
  }

  // Gestion des couleurs selon le statut
  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-500'
      case 'success':
        return 'text-green-500'
      case 'failed':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  // Gestion des couleurs de fond pour la barre de progression
  const getProgressBarColor = () => {
    switch (status) {
      case 'processing':
        return 'bg-blue-500'
      case 'success':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  // Démarrer le polling au montage du composant
  useEffect(() => {
    if (id) {
      startPolling()
    }

    return () => {
      stopPolling()
    }
  }, [id, startPolling])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  } as const;

  return (
    <Layout title='Résultat de l extraction'>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className=" p-4 md:p-6"
      >
        {/* En-tête */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Résultat de l'extraction
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Suivi en temps réel de l'analyse de votre document
          </p>
        </motion.div>

        {/* Carte principale */}
        <motion.div
          variants={itemVariants}
          className=" dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* En-tête de la carte */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Statut de l'extraction
                </h2>
                {taskId && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Task ID: <span className="font-mono">{taskId.substring(0, 8)}...</span>
                  </p>
                )}
              </div>
              <div className={`px-4 py-2 rounded-full font-medium ${status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' : status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300'}`}>
                {status === 'processing' ? 'EN COURS' : status === 'success' ? 'Terminée' : 'Échec'}
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {/* Barre de progression */}
            {status === 'processing' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progression</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${getProgressBarColor()}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Indicateur de statut */}
            <div className="flex items-center gap-4 mb-8">
              {status === 'processing' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"
                />
              )}
              
              {status === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
              
              {status === 'failed' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.div>
              )}

              <div>
                <h3 className={`text-lg font-medium ${getStatusColor()}`}>
                  {getStatusMessage()}
                </h3>
                {status === 'processing' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Commencez l'extraction...
                  </p>
                )}
              </div>
            </div>

            {/* Message détaillé */}
            <AnimatePresence mode="wait">
              {message && status === 'processing' && (
                <motion.div
                  key="processing-message"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-blue-500 mt-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-blue-800 dark:text-blue-300 font-medium">Étape en cours</p>
                      <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">{message}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Résultat */}
              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    Résultat extrait
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                        {result}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Erreur */}
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 mb-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-red-500 mt-0.5">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-red-800 dark:text-red-300 font-semibold">Erreur</h4>
                      <p className="text-red-700 dark:text-red-400 mt-2">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              {status === 'failed' && (
                <button
                  onClick={startPolling}
                  className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Réessayer
                </button>
              )}

              {status === 'success' && (
                <button
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 bg-linear-to-r from-blue-600  to-purple-700 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nouvelle extraction
                </button>
              )}

              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Retour au dashboard
              </button>
            </motion.div>
          </div>
        </motion.div>

      </motion.div>
    </Layout>
  )
}

export default ResponseExtraction