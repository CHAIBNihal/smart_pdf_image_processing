import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../Layout/Layout";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AuthStore } from "../../Store/auth/AuthStore";
import { createAnalyse } from "../../api/services/analyseService";

const ExtraireFile = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const { user } = AuthStore();
  const [subject, setSubject] = useState("");
  const { id } = useParams();
  const name = searchParams.get("name");
  const [error, setError] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const navigate = useNavigate();

  // Fonction d'initialisation de session
  const initializeSession = async (subjectText: string) => {
    try {
      if (!user || !id) {
        throw new Error("Utilisateur ou ID manquant");
      }
      const res = await createAnalyse(id, user.sub, subjectText);
      if (!res?.id) {
        throw new Error("Réponse invalide de l'API");
      }
      return res.id;
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
      throw new Error("Échec de l'initialisation de la session");
    }
  };

  const handleExtract = async () => {
    if (!subject.trim()) {
      setError("Veuillez saisir un sujet d'extraction");
      return;
    }

    setIsButtonLoading(true);
    setError("");
    
    try {
      // Étape 1 : Initialiser la session
      const newAnalyseId = await initializeSession(subject);
      
      // Étape 2 : Simulation d'extraction (à remplacer par votre logique réelle)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Étape 3 : Navigation vers la page d'extraction
      navigate(`/Extraction/${newAnalyseId}?name=${encodeURIComponent(subject)}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Erreur lors de l'extraction";
      setError(errorMessage);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value);
    if (error) setError("");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        delayChildren: 0,
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

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { type: "spring" as const, stiffness: 400 }
    },
    tap: { scale: 0.95 },
    loading: { 
      scale: [1, 1.05, 1] as [number, number, number],
      transition: { 
        repeat: Infinity,
        duration: 0.8
      }
    }
  } as const;

  const spinAnimation = {
    animate: { rotate: 360 },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear" as const
    }
  } as const;

  // Corrigé : Classes Tailwind CSS
  const gradientTextClasses = `
    uppercase font-bold 
    bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 
    bg-[length:200%_auto] bg-clip-text text-transparent
  `;

  return (
    <Layout title="Commencez l'extraction">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center min-h-50"
          >
            <motion.div
              {...spinAnimation}
              className="flex justify-center items-center"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="h-14 w-14 rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-0 h-14 w-14 rounded-full border-2 border-transparent border-b-green-500 border-l-yellow-500"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-white"
          >
            <motion.p 
              variants={itemVariants}
              className="text-slate-100 text-2xl font-semibold text-start mb-8"
            >
              Quel contenu souhaitez-vous extraire de{" "}
              <motion.span 
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ backgroundPosition: "100% 50%" }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                className={gradientTextClasses}
              >
                {name || "le document"}
              </motion.span>
              ?
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="px-4 mt-6 flex flex-col items-start gap-6 max-w-2xl"
            >
              <div className="w-full">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  placeholder="ex: La définition de cours Next.js"
                  value={subject}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleExtract()}
                  className="w-full border border-neutral-600 shadow-lg shadow-neutral-900 rounded-lg py-3 px-4 bg-neutral-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                />
                
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-400 text-sm mt-2 px-2"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-4 w-full">
                <motion.button
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  animate={isButtonLoading ? "loading" : "initial"}
                  onClick={handleExtract}
                  disabled={isButtonLoading}
                  className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg font-medium shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isButtonLoading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Extraction en cours...
                    </>
                  ) : (
                    "Commencez l'extraction"
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Section d'aperçu */}
            <motion.div
              variants={itemVariants}
              className="mt-12 p-6 border border-neutral-700/50 rounded-xl bg-neutral-900/30 backdrop-blur-sm"
            >
              <h3 className="text-lg font-semibold mb-4 text-neutral-300">
                Conseils pour une meilleure extraction
              </h3>
              <ul className="space-y-2 text-neutral-400">
                <motion.li 
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Soyez précis dans votre demande
                </motion.li>
                <motion.li 
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Mentionnez les sections spécifiques
                </motion.li>
                <motion.li 
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Précisez le type de contenu (définitions, exemples, etc.)
                </motion.li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default ExtraireFile;