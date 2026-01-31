import { FcFile } from "react-icons/fc";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { createUpload } from "../../api/services/uploadService";
import { AuthStore } from "../../Store/auth/AuthStore";
import Header from "../Header/Header";

type DocumentType = "documents" | "images";

const CreateUpload = () => {
  const [documentName, setDocumentName] = useState("");
  const [typeDocument, setTypeDocument] = useState<DocumentType>("documents");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadId, setUploadId] = useState<string>("")
  const [errorUploadCreation, setUploadCreationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const {user} = AuthStore();

  // Correction: ajout de typeDocument dans les dépendances
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentName.trim()) return;
    if(!user) return;
    
    setIsSubmitting(true);
    setUploadCreationError(null); // Réinitialiser l'erreur
  
    const res = await createUpload(documentName, user.sub);
    if (!res.success) {
      setUploadCreationError("Erreur lors de la création de l'upload. Veuillez réessayer.");
      setIsSubmitting(false);
      return;
    }
    
    // Pas besoin de setTimeout si l'API répond déjà
    setIsSubmitting(false);
    setUploadId(res.upload.id)
    navigate(`/uploadFile/${res.upload.id}?type=${typeDocument}&name=${res.upload.motif}`);
    setDocumentName("");
  },[user, documentName, typeDocument, navigate]); 

  const handleTypeChange = (type: DocumentType) => {
    setTypeDocument(type);
  };

  return (
    <Layout title="Nouveau document">
      <div className="mx-auto p-1">
        {/* En-tête amélioré */}
        <Header
          title="Télécharger un document"
          icon={<FcFile size={32} />}
          paragraph="Analysez votre document après le téléchargement"
        />

        {/* Formulaire amélioré */}
        {/* Correction: bg-linear-to-b -> bg-linear-to-b */}
        <div className="bg-linear-to-b from-neutral-900/50 to-neutral-800/30 border border-neutral-700 rounded-xl p-6 shadow-xl">
          {/* En-tête de section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 inline-flex justify-center items-center p-1 bg-neutral-500 rounded-full text-white font-medium text-sm">
                1
              </div>
              <h2 className="text-xl font-semibold text-white">
                Informations du document
              </h2>
            </div>
            <p className="text-slate-400 text-sm">
              Nommez votre document pour faciliter son identification
            </p>
          </div>

          {/* Afficher l'erreur si elle existe */}
          {errorUploadCreation && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{errorUploadCreation}</p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            {/* Nom du document */}
            <div className="mb-6">
              <label className="block text-slate-300 mb-3 font-medium">
                Nom du document <span className="text-red-400 ml-1">*</span>
                <span className="block text-slate-500 text-sm font-normal mt-1">
                  Ex: facture_août_2024, contrat_client, etc.
                </span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="facture mois août"
                  className={`w-full bg-neutral-900/80 border ${
                    isFocused
                      ? "border-blue-500 shadow-lg shadow-blue-500/10"
                      : "border-neutral-700 hover:border-neutral-600"
                  } rounded-lg px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none transition-all duration-200`}
                  disabled={isSubmitting}
                />

                {/* Indicateur de caractères */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {documentName.length > 0 && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        documentName.length < 3
                          ? "bg-red-500/20 text-red-400"
                          : documentName.length > 50
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {documentName.length}/50
                    </span>
                  )}
                </div>
              </div>

              {/* Conseils */}
              <div className="mt-3 space-y-1">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
                  Utilisez un nom descriptif et concis
                </p>
              </div>
            </div>

            {/* Type de document */}
            <div className="mb-6">
              <label className="block text-slate-300 mb-3 font-medium">
                Type du document <span className="text-red-400 ml-1">*</span>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange("documents")}
                  disabled={isSubmitting}
                  className={`flex-1 border rounded-lg px-4 py-3 text-center transition-all duration-200 ${
                    typeDocument === "documents"
                      ? "bg-blue-500/10 border-blue-500 text-blue-400"
                      : "bg-neutral-900/80 border-neutral-700 text-slate-400 hover:border-neutral-600 hover:text-slate-300"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="font-medium">Document</div>
                  <div className="text-xs mt-1 opacity-70">PDF</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange("images")}
                  disabled={isSubmitting}
                  className={`flex-1 border rounded-lg px-4 py-3 text-center transition-all duration-200 ${
                    typeDocument === "images"
                      ? "bg-blue-500/10 border-blue-500 text-blue-400"
                      : "bg-neutral-900/80 border-neutral-700 text-slate-400 hover:border-neutral-600 hover:text-slate-300"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="font-medium">Image</div>
                  <div className="text-xs mt-1 opacity-70">JPG, PNG, GIF</div>
                </button>
              </div>

              {/* Conseils */}
              <div className="mt-3 space-y-1">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
                  Sélectionnez le type de fichier à télécharger
                </p>
              </div>
            </div>

            {/* Bouton d'action amélioré */}
            <div className="flex justify-end pt-4 border-t border-neutral-700/50">
              <button
                type="submit"
                disabled={!documentName.trim() || isSubmitting}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  !documentName.trim() || isSubmitting
                    ? "bg-neutral-800 text-slate-500 cursor-not-allowed"
                    : "bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Traitement...
                  </>
                ) : (
                  <>
                    <span>Valider et continuer</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Indicateur d'étape */}
          <div className="mt-6 pt-6 border-t border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Correction: bg-linear-to-br -> bg-linear-to-br */}
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">1</span>
                </div>
                <span className="text-white text-sm font-medium">
                  Informations
                </span>
              </div>

              <div className="h-px flex-1 mx-4 bg-neutral-700"></div>

              <div className="flex items-center gap-3 opacity-40">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                  <span className="text-slate-400 font-medium text-sm">2</span>
                </div>
                <span className="text-slate-400 text-sm">Téléchargement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateUpload;