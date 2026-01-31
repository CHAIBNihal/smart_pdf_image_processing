import { useCallback, useEffect, useState } from 'react'
import Layout from '../Layout/Layout'
import { useNavigate, useParams } from 'react-router-dom'
import type { IUpload } from '../../Interfaces/Upload'
import { getUploadById } from '../../api/services/uploadService'
import { CloudUpload, FileText, Image as ImageIcon, AlertCircle, Download, ExternalLink, Info, BrainCog } from 'lucide-react'
import Header from '../Header/Header'

const SingleUpload = () => {
    const navigation = useNavigate();
    const {id} = useParams();
    const [upload, setUpload] = useState<IUpload>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

    //===============================
    // Api Call (Get Upload with id )
    //===============================

   const getUpload = useCallback(async () => {
      try {
        setLoading(true);
        setError("");
        if (!id) {
          setError("ID de téléchargement manquant");
          setLoading(false);
          return;
        }
        const response = await getUploadById(id);
        if (!response.success) {
          setError(
            "La récupération des détails de ce téléchargement a échoué ! Réessayez plus tard !",
          );
          setLoading(false);
          return;
        }
        setUpload(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(
          `${error ? error : "Une erreur est survenue. Réessayez plus tard !"}`,
        );
      }
    }, [id]);

    useEffect(()=>{
      getUpload()
    }, [getUpload])

    //===============================
    // Function utils 
    //===============================

    // ================Extraire le type de fichier depuis le url supabase================
    const getFileType = (url: string): 'image' | 'pdf' | 'unknown' => {
      const urlWithoutQuery = url.split('?')[0];
      const extension = urlWithoutQuery.split('.').pop()?.toLowerCase();
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension || '')) {
        return 'image';
      }
      if (extension === 'pdf') {
        return 'pdf';
      }
      return 'unknown';
    }

    const handleImageError = (fileId: string) => {
      setImageLoadErrors(prev => new Set(prev).add(fileId));
    }

    // ================= Obtenir le icon selon le type de fichier ===========================
    const getFileIcon = (type: 'image' | 'pdf' | 'unknown') => {
      switch(type) {
        case 'image':
          return <ImageIcon className="w-5 h-5 text-green-500" />;
        case 'pdf':
          return <FileText className="w-5 h-5 text-neutral-400" />;
        default:
          return <FileText className="w-5 h-5 text-gray-400" />;
      }
    }

    if(loading){
      return (
        <Layout title="Chargement...">
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-400 text-sm animate-pulse">Chargement des détails...</p>
          </div>
        </Layout>
      )
    }

    if(error){
      return (
        <Layout title="Erreur">
          <div className='max-w-2xl mx-auto mt-8'>
            <div className='bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-start gap-4'>
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-red-500 font-semibold text-lg mb-2">Une erreur est survenue</h3>
                <p className="text-gray-300">{error}</p>
                <button 
                  onClick={getUpload}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </Layout>
      )
    }

  return (
    <Layout title="Informations de téléchargement">
      <div className="mx-auto">
        {upload && (
          <>
            {/* Header */}
            <Header icon={ <Info size={32} />} title={upload.motif} paragraph={`ID: ${upload.id.substring(0, 8)}...`}/>
           {/** Actions Boutons  */}
           <section className='flex justify-center items-center mb-12'>
            <div className='flex justify-between items-center gap-6 '>
              <button
                  onClick={() => navigation(`/uploadFile/${id}`)}
                  className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-900  text-white px-2 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <CloudUpload className="w-4 h-4" />
                  <p className='text-sm'>{upload.uploadfile.length === 0 ? "Télécharger un document" : "Télécharger un autre fichier  "}</p>
                </button>
                {upload.uploadfile.length ? (<button
                  onClick={() => navigation(`/initial-session/${id}?name=${upload.motif}`)}
                  className="flex items-center gap-2 bg-neutral-500  text-white px-2 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <BrainCog className="w-4 h-4" />
                  <p className='text-sm'>Extrayez le document </p>
                </button>) : null}
            </div>
           </section>
            {/* Section des fichiers */}
            <div>
              

              {upload.uploadfile.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-2xl bg-gray-800/30">
                  <CloudUpload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">Aucun fichier téléchargé</p>
                  <p className="text-gray-600 text-sm">Commencez par ajouter votre premier document</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {upload.uploadfile.map((file, index) => {
                    const LastFile = file.isLast && file.file;
                    const fileType =  getFileType(LastFile.toString());
                    const hasImageError = imageLoadErrors.has(file.id);

                    return (
                      <div
                        key={file.id}
                        className="border border-gray-700 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm hover:border-gray-600 transition-all"
                      >
                        {/* En-tête du fichier */}
                        <div className=" p-4  flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-700/50 rounded-lg">
                              {getFileIcon(fileType)}
                            </div>
                            <div>
                              <p className="font-semibold text-lg uppercase text-slate-100 flex items-center gap-2">
                                {fileType}
                              </p>
                             
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                Télécharger le: {upload.createdAt.split("T")[0]}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={file.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                              title="Ouvrir dans un nouvel onglet"
                            >
                              <ExternalLink className='w-5 h-5'/>
                            </a>
                            <a
                              href={file.file}
                              download
                              className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                              title="Télécharger"
                            >
                              <Download className='w-5 h-5'/>
                            </a>
                          </div>
                        </div>

                        {/* Contenu du fichier */}
                        <div className="py-2">
                          {fileType === "image" ? (
                            <div className="flex justify-center">
                              {!hasImageError ? (
                                <img
                                  src={file.file}
                                  alt={`Fichier ${index + 1}`}
                                  className="max-h-96 w-auto object-contain rounded-lg shadow-lg"
                                  onError={() => handleImageError(file.id)}
                                />
                              ) : (
                                <div className="bg-gray-700/50 p-8 rounded-lg text-center">
                                  <ImageIcon className="w-16 h-16 text-gray-500 mx-auto mb-3" />
                                  <p className="text-gray-400">Image non disponible</p>
                                </div>
                              )}
                            </div>
                          ) : fileType === "pdf" ? (
                            <div className="space-y-4">
                              <div className=" p-4 rounded-xl ">
                                <iframe
                                  src={`${file.file}#view=fitH`}
                                  className="w-full h-96 rounded-lg"
                                  title={`Aperçu PDF - Fichier ${index + 1}`}
                                  onError={(e) => {
                                    console.error("Erreur de chargement du PDF:", e);
                                  }}
                                />
                              </div>
                              <div className="text-center">
                                <a
                                  href={file.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 underline transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Ouvrir le PDF dans un nouvel onglet
                                </a>
                                <p className="text-sm text-gray-500 mt-2">
                                  Si le PDF ne s'affiche pas correctement
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12 bg-gray-700/30 rounded-xl">
                              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                              <p className="text-gray-400 mb-4 text-lg">
                                Aperçu non disponible pour ce type de fichier
                              </p>
                              <a
                                href={file.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 underline transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Ouvrir le fichier
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default SingleUpload