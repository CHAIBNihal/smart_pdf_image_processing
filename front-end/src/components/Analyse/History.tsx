import { useCallback, useEffect, useState } from "react";
import Layout from "../Layout/Layout";
import { Clock, GitGraph, AlertCircle } from "lucide-react";
import type { IAnalyseResponse } from "../../Interfaces/Analyse";
import { AuthStore } from "../../Store/auth/AuthStore";
import { getAnalyseByClientId } from "../../api/services/analyseService";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiEye, FiGrid, FiList, FiTrash2 } from "react-icons/fi";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Header from "../Header/Header";

const History = () => {
  const [data, setData] = useState<IAnalyseResponse[]>([]);
  const [switcherView, setSwitcherView] = useState<"grid" | "list">("list");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = AuthStore();
  const navigate = useNavigate();

  const fetchAnalyseClientData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!user) {
        setError("Utilisateur non connecté");
        setLoading(false);
        return;
      }

      const res = await getAnalyseByClientId(user.sub);
      if (!res || !Array.isArray(res)) {
        setError("Aucune analyse trouvée");
        setData([]);
      } else {
        setData(res);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des analyses:", error);
      setError("Échec de la récupération des données");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalyseClientData();
  }, [fetchAnalyseClientData]);

  const handleDeleteAnalyse = async (id: string) => {
    try {
      console.log("Suppression de l'analyse:", id);
      // Implémentez la logique de suppression ici
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleViewAnalyse = (uploadId: string) => {
    navigate(`/extraction/id/${uploadId}`);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy 'à' HH:mm", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const truncateId = (id: string) => {
    if (id.length <= 10) return id;
    return `${id.substring(0, 8)}...`;
  };

  // Grid View améliorée
  const GridView = ({ history }: { history: IAnalyseResponse[] }) => {
    if (history.length === 0) {
      return (
        <div className="mt-8 p-8 text-center rounded-xl border border-neutral-700/50 bg-neutral-900/30">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800/50 flex items-center justify-center">
            <GitGraph className="text-neutral-400" size={24} />
          </div>
          <h3 className="text-neutral-300 font-medium mb-2">Aucune analyse</h3>
          <p className="text-neutral-400 text-sm">
            Vos analyses apparaîtront ici
          </p>
        </div>
      );
    }

    return (
      <div className="px-2 py-3 grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
        {history.map((item, key) => (
          <div
            className="group relative bg-linear-to-b from-neutral-900/50 to-neutral-800/30 border border-neutral-700 rounded-xl p-4 
                      hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/5 
                      transition-all duration-300 ease-out"
            key={key}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                  <GitGraph size={20} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">
                    {truncateText(item.prompt)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    ID: {truncateId(item.uploadId)}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                <FiCalendar size={14} />
                <span>{formatDate(item.created_at)}</span>
              </div>
             
            </div>

            {/* Footer - Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-700/50">
             
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleViewAnalyse(item.uploadId)}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors duration-200"
                  title="Voir l'analyse"
                >
                  <FiEye size={16} />
                </button>
                <button
                  onClick={() => handleDeleteAnalyse( item.uploadId)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                  title="Supprimer"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Table View améliorée
  const ListView = ({ history }: { history: IAnalyseResponse[] }) => {
    if (history.length === 0) {
      return (
        <div className="mt-8 p- text-center rounded-xl border border-neutral-700/50 bg-neutral-900/30">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800/50 flex items-center justify-center">
            <GitGraph className="text-neutral-400" size={24} />
          </div>
          <h3 className="text-neutral-300 font-medium mb-2">Aucune analyse</h3>
          <p className="text-neutral-400 text-sm">
            Vos analyses apparaîtront ici
          </p>
        </div>
      );
    }

    return (
      <div className="bg-linear-to-b from-neutral-900/30 to-neutral-800/20 border border-neutral-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800/30 border-b border-neutral-700/50">
              <tr>
                <th className="p-3 text-left text-slate-400 font-medium text-sm uppercase tracking-wider">
                  Analyse
                </th>
                <th className="p-3 text-left text-slate-400 font-medium text-sm uppercase tracking-wider">
                  Date
                </th>
                
                <th className="p-3 text-left text-slate-400 font-medium text-sm uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr
                  className={`group border-b border-neutral-700/30 hover:bg-neutral-800/20 transition-colors duration-200 ${
                    index % 2 === 0 ? "bg-neutral-900/10" : ""
                  }`}
                  key={index}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <GitGraph size={18} className="text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                          {truncateText(item.prompt, 40)}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          ID: {truncateId(item.uploadId)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <FiCalendar size={14} className="text-slate-500" />
                      <span className="text-slate-300 text-sm">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </td>
                 
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewAnalyse(item.uploadId)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors duration-200"
                        title="Voir l'analyse"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAnalyse(item.uploadId)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
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
      </div>
    );
  };

  if (loading) {
    return (
      <Layout title="Historique des Extraits">
        <div className="flex flex-col justify-center items-center h-96 gap-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-900/30"></div>
            <div className="absolute top-0 left-0 animate-spin rounded-full h-20 w-20 border-4 border-t-purple-500 border-r-purple-500/50"></div>
            <div className="absolute top-0 left-0 animate-spin rounded-full h-20 w-20 border-4 border-t-transparent border-r-transparent border-b-blue-500 border-l-blue-500/50 animate-reverse"></div>
          </div>
          <div className="text-center">
            <p className="text-neutral-300 text-lg font-medium mb-2">
              Chargement des analyses...
            </p>
            <p className="text-neutral-400 text-sm">
              Veuillez patienter un moment
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && data.length === 0) {
    return (
      <Layout title="Historique des Extraits">
        <div className="mt-6 p-6 rounded-xl border border-red-800/30 bg-linear-to-br from-red-900/10 to-red-800/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center shrink-0">
              <AlertCircle className="text-red-400" size={24} />
            </div>
            <div>
              <h3 className="text-red-300 font-semibold text-lg mb-2">Erreur</h3>
              <p className="text-red-400/90 mb-4">{error}</p>
              <button
                onClick={fetchAnalyseClientData}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Historique des Extraits">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="mt-2">
         <Header icon={<Clock size={28} className="text-blue-400" />} title="Historique des Analyses"  paragraph="Consultez et gérez toutes vos analyses de documents"/>

        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-neutral-800/30 rounded-xl p-1 border border-neutral-700/50">
          <button
            className={` p-2 rounded-lg transition-all duration-200 ${
              switcherView === "grid"
                ? "bg-neutral-700 text-white shadow-inner"
                : "text-slate-400 hover:text-white hover:bg-neutral-700/50"
            }`}
            onClick={() => setSwitcherView("grid")}
            title="Vue Grille"
          >
            <FiGrid size={20} />
            
          </button>
          <button
            onClick={() => setSwitcherView("list")}
            className={` p-2 rounded-lg transition-all duration-200 ${
              switcherView === "list"
                ? "bg-neutral-700 text-white shadow-inner"
                : "text-slate-400 hover:text-white hover:bg-neutral-700/50"
            }`}
            title="Vue Liste"
          >
            <FiList size={20} />
            
          </button>
        </div>
      </div>

      {/* Content */}
      {switcherView === "grid" ? (
        <GridView history={data} />
      ) : (
        <ListView history={data} />
      )}
    </Layout>
  );
};

export default History;