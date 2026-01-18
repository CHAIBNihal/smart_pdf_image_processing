import  { useCallback, useEffect, useState } from "react";
import Layout from "../Layout/Layout";
import { FcFile, FcViewDetails } from "react-icons/fc";
import { 
  FiEye, 
  FiTrash2, 
  FiGrid, 
  FiList, 
  FiSearch, 
  FiCalendar,
  FiFileText
} from "react-icons/fi";
import type { IUploads } from "../../Interfaces/Upload";
import { AuthStore } from "../../Store/auth/AuthStore";
import { deleteUpload, getUserUpload } from "../../api/services/uploadService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const Uploads = () => {
  const [data, setData] = useState<IUploads[]>([]);
  const [filteredData, setFilteredData] = useState<IUploads[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countData, setCountData] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = AuthStore();
  const navigate = useNavigate();

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const getMyUploads = useCallback(async () => {
    try {
      if (!user) return;
      setLoading(true);
      const response = await getUserUpload();
      if (!response.uploads) {
        setError("Erreur en récupération des téléchargements!");
        setData([]);
        setFilteredData([]);
        return;
      }
      setData(response.uploads);
      setFilteredData(response.uploads);
      setCountData(response.count || response.uploads.length);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Un problème est survenu. Réessayez plus tard!");
      setData([]);
      setFilteredData([]);
      setCountData(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Filtrer les données selon le terme de recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item =>
      item.motif.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  useEffect(() => {
    getMyUploads();
  }, [getMyUploads]);

  // Fonction pour supprimer un upload
  const handleDelete = async (id: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer cet upload : ${id} ?`)) {
      try {
        // Appeler votre API de suppression ici
        await deleteUpload(id);
        // Rafraîchir la liste
        getMyUploads();
      } catch (error) {
        setError("Erreur lors de la suppression");
      }
    }
  };

  // Fonction pour voir les détails
  const handleViewDetails = (id: string) => {
    navigate(`/details-upload/${id}`);
  };

  if (loading) {
    return (
      <Layout title="Téléchargements">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Chargement des téléchargements...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Téléchargements">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600/20 to-blue-800/20 rounded-2xl border border-blue-500/30">
              <FcViewDetails size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Mes Téléchargements
              </h1>
              <p className="text-slate-400">
                {countData} document{countData > 1 ? 's' : ''} trouvé{countData > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {/* Boutons de vue */}
          <div className="flex items-center gap-2 bg-neutral-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-neutral-700'}`}
              title="Vue grille"
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-neutral-700'}`}
              title="Vue liste"
            >
              <FiList size={20} />
            </button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-900/80 border border-neutral-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
          <button
            onClick={getMyUploads}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Aucune donnée */}
      {!loading && filteredData.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-neutral-800/50 rounded-full mb-4">
            <FcFile size={48} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Aucun téléchargement</h3>
          <p className="text-slate-400 mb-6">Commencez par télécharger votre premier document</p>
          <button
            onClick={() => navigate('/createUpload')}
            className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all"
          >
            <FiFileText className="inline mr-2" />
            Nouveau téléchargement
          </button>
        </div>
      )}

      {/* Vue grille */}
      {viewMode === 'grid' && filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((upload) => (
            <div
              key={upload.id}
              className="bg-linear-to-b from-neutral-900/50 to-neutral-800/30 border border-neutral-700 rounded-xl p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FcFile size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white truncate max-w-[200px]">
                      {upload.motif}
                    </h3>
                    <p className="text-xs text-slate-500">ID: {upload.id.substring(0, 8)}...</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(upload.id)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Voir les détails"
                  >
                    <FiEye size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(upload.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <FiCalendar size={16} />
                  <span>{formatDate(upload.createdAt)}</span>
                </div>
                <div className="pt-4 border-t border-neutral-700/50">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Dernière modification</span>
                    <span>{formatDate(upload.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vue liste */}
      {viewMode === 'list' && filteredData.length > 0 && (
        <div className="bg-linear-to-b from-neutral-900/30 to-neutral-800/20 border border-neutral-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-800/50 border-b border-neutral-700">
                <th className="py-2 px-6 text-left text-slate-400 font-medium">ID</th>
                  <th className="py-2 px-6 text-left text-slate-400 font-medium">Document</th>
                  <th className="py-2 px-6 text-left text-slate-400 font-medium">Date de création</th>
                  <th className="py-2 px-6 text-left text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((upload, index) => (
                  <tr 
                    key={upload.id} 
                    className={`border-b border-neutral-700/50 hover:bg-neutral-800/30 transition-colors ${index % 2 === 0 ? 'bg-neutral-900/20' : ''}`}
                  >
                    <td className="py-2 px-6">
                        <p className=" text-slate-500">{upload.id.substring(0, 12)}...</p>
                    </td>
                    <td className="py-2 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <FcFile size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{upload.motif}</p>
                        </div>
                      </div>
                    </td>
                    
                    
                    <td className="py-2 px-6">
                      <div className="flex items-center gap-2">
                        <FiCalendar size={16} className="text-slate-500" />
                        <span className="text-slate-300">{formatDate(upload.createdAt)}</span>
                      </div>
                    </td>
                   
                    <td className="py-2 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(upload.id)}
                          className="px-3 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 rounded-lg transition-colors flex items-center gap-2"
                          title="Voir les détails"
                        >
                          <FiEye size={16} />
                          <span className="text-sm">Détails</span>
                        </button>
                        <button
                          onClick={() => handleDelete(upload.id)}
                          className="px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 rounded-lg transition-colors flex items-center gap-2"
                          title="Supprimer"
                        >
                          <FiTrash2 size={16} />
                         
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pied de tableau */}
          <div className="p-4 bg-neutral-800/50 border-t border-neutral-700">
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm">
                Affichage de {filteredData.length} sur {countData} document{countData > 1 ? 's' : ''}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-4 py-2 text-sm bg-neutral-700 text-slate-300 hover:text-white hover:bg-neutral-600 rounded-lg transition-colors"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pagination (optionnel) */}
      {filteredData.length > 0 && (
        <div className="mt-8 flex justify-between items-center">
          <div className="text-slate-400 text-sm">
            Affichage de 1 à {filteredData.length} sur {countData} résultat{countData > 1 ? 's' : ''}
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-neutral-800 text-slate-400 rounded-lg hover:bg-neutral-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Précédent
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Suivant
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Uploads;