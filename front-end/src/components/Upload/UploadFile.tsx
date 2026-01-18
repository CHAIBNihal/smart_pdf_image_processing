import { useParams, useSearchParams } from "react-router-dom";
import Layout from "../Layout/Layout";
import { useState, useEffect, useRef } from "react";
import { FiUploadCloud, FiFileText, FiImage, FiCheck, FiX, FiArrowRight } from "react-icons/fi";
import { FcFile, FcPicture } from "react-icons/fc";
import { uploadFiles } from "../../api/services/uploadService";
import { AuthStore } from "../../Store/auth/AuthStore";

const UploadFile = () => {
  const [searchParams] = useSearchParams();
  const {id} = useParams()
  const {user} = AuthStore()
  const type = searchParams.get("type");
  const [isTypeOnQuery, setIsTypeOnQuery] = useState<boolean>(false);
  const [documentType, setDocumentType] = useState<"documents" | "images">("documents");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (type) {
      setIsTypeOnQuery(true);
      setDocumentType(type === "images" ? "images" : "documents");
    } else {
      setIsTypeOnQuery(false);
    }
  }, [type]);

  const handleTypeChange = (typeDoc: "images" | "documents") => {
    setDocumentType(typeDoc);
    setSelectedFile(null); 
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const documentTypes = ['application/pdf'];
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (documentType === "documents" && !documentTypes.includes(file.type)) {
      alert("Format non supporté. Seuls les fichiers PDF sont acceptés pour les documents.");
      return;
    }
    
    if (documentType === "images" && !imageTypes.includes(file.type)) {
      alert("Format non supporté. Formats acceptés : JPG, PNG, GIF, WEBP.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Le fichier est trop volumineux. Maximum 10MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsUploading(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || uploadProgress < 100) return;
    if (!id || !user) return;

    try {
      setIsAnalyzing(true);
      await uploadFiles(id, user?.sub, documentType, selectedFile);
      // Simulate analysis
      setTimeout(() => {
        setIsAnalyzing(false);
        alert("Analyse terminée !");
      }, 2000);
    } catch (error) {}
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = () => {
    if (!selectedFile) return <FiUploadCloud className="w-12 h-12 text-blue-400" />;
    
    if (selectedFile.type.includes('image')) return <FiImage className="w-12 h-12 text-purple-400" />;
    if (selectedFile.type === 'application/pdf') return <FiFileText className="w-12 h-12 text-purple-400" />;
    
    return <FcFile className="w-12 h-12" />;
  };

  const getAcceptedExtensions = () => {
    return documentType === "documents" ? ".pdf" : ".jpg, .png, .gif, .webp";
  };

  return (
    <Layout title="Nouveau téléchargement">
      <div className="  p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl border border-neutral-700">
              <FcFile className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Télécharger un fichier 
            </h1>
          </div>
          <p className="text-slate-400">
            {documentType === "documents" 
              ? "Téléchargez un document PDF pour analyse" 
              : "Téléchargez une image pour analyse"}
          </p>
        </div>

        {/* Type Selection (if not in URL) */}
        {!isTypeOnQuery && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Choisir le type de document <span className="text-red-400">*</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleTypeChange("documents")}
                className={`p-6 border-2 rounded-xl transition-all duration-200 ${
                  documentType === "documents"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-neutral-700 bg-neutral-900/50 hover:border-neutral-600"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${documentType === "documents" ? "bg-blue-500/20" : "bg-neutral-800"}`}>
                    <FcFile className="w-8 h-8" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">Document</div>
                    <div className="text-sm text-slate-400 mt-1">PDF uniquement</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("images")}
                className={`p-6 border-2 rounded-xl transition-all duration-200 ${
                  documentType === "images"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-neutral-700 bg-neutral-900/50 hover:border-neutral-600"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${documentType === "images" ? "bg-blue-500/20" : "bg-neutral-800"}`}>
                    <FcPicture className="w-8 h-8" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">Image</div>
                    <div className="text-sm text-slate-400 mt-1">JPG, PNG, GIF, WEBP</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Upload Zone */}
        <div className="bg-gradient-to-b from-neutral-900/30 to-neutral-800/20 border border-neutral-700 rounded-2xl p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Téléchargement du fichier <span className="text-red-400">*</span></h2>
            <p className="text-slate-400 text-sm">
              Formats acceptés :  Maximum 10MB • .png .jpg .jpeg • {getAcceptedExtensions()} 
            </p>
          </div>

          {/* Upload Area */}
          <div
            className={`border-3 ${
              isDragging 
                ? 'border-blue-500 bg-blue-500/5' 
                : selectedFile 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : 'border-dashed border-neutral-600'
            } rounded-xl p-8 text-center transition-all duration-200 mb-6`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept={documentType === "documents" ? ".pdf" : "image/*"}
            />
            
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4">
                {getFileIcon()}
              </div>
              
              {selectedFile ? (
                <>
                  <div className="mb-2">
                    <h3 className="text-lg font-medium text-white">{selectedFile.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <FiX className="inline mr-2" />
                      Supprimer
                    </button>
                    {uploadProgress < 100 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpload();
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FiUploadCloud className="inline mr-2" />
                        Télécharger
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Glissez-déposez votre fichier ici
                  </h3>
                  <p className="text-slate-400 mb-4">ou cliquez pour parcourir</p>
                  <button
                    type="button"
                    className="px-6 py-3 bg-neutral-600 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all"
                  >
                    <FiUploadCloud className="inline mr-2" />
                    Sélectionner un fichier
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Progression du téléchargement</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* File Info */}
          {selectedFile && uploadProgress >= 100 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <FiCheck className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Fichier téléchargé avec succès</h4>
                  <p className="text-slate-400 text-sm">Prêt pour l'analyse</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!selectedFile || uploadProgress < 100 || isAnalyzing}
            className={`px-8 py-4 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 ${
              !selectedFile || uploadProgress < 100 || isAnalyzing
                ? 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                : 'bg-purple-700 text-white hover:from-purple-500 hover:to-purple-600 hover:shadow-xl hover:shadow-green-500/20'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyse en cours...
              </>
            ) : (
              <>
                <span>Analyser le document</span>
                <FiArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-neutral-900/30 border border-neutral-700 rounded-xl">
          <h3 className="text-sm font-semibold text-white mb-2">À propos de l'analyse</h3>
          <ul className="text-slate-400 text-sm space-y-1">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              Extraction automatique du texte et des données
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              Détection des entités importantes
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              Génération de résumé intelligent
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default UploadFile;