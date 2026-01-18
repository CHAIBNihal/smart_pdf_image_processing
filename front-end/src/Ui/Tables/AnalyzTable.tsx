import  { useCallback, useEffect, useState } from "react";
import type { IAnalyseResponse } from "../../Interfaces/Analyse";
import { getAnalyseByClientId } from "../../api/services/analyseService";
import { AuthStore } from "../../Store/auth/AuthStore";
import { Cpu, Eye, Sparkles } from "lucide-react";

const AnalyzTable = () => {
  const [data, setData] = useState<IAnalyseResponse[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = AuthStore();
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        console.log("User is Founded", user)
        const res = await getAnalyseByClientId(user.sub);
        console.log("Api response ==> ", res)
        setData(res);
      } 
    } catch (error) {
      console.error("Error fetching analyse data:", error);
      setError("Erreur lors de la récupération des données d'analyse.");
    } finally {
      setLoading(false);
    }
  }, [user?.sub]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4 bg-[#242424] p-4 rounded-xl">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-800"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-400 border-r-purple-400 absolute top-0 left-0"></div>
        </div>
        <p className="text-neutral-300 text-sm font-medium">Chargement des analyses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-6 rounded-xl  border border-red-800/30 bg-[#242424]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
            <span className="text-red-400 text-xl">⚠</span>
          </div>
          <div>
            <h3 className="text-red-300 font-semibold">Erreur</h3>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="mt-6 p-12 rounded-xl bg-linear-to-br from-neutral-900/50 to-neutral-800/50 border border-neutral-700 text-center bg-[#242424]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
          <Sparkles size={28} className="text-neutral-400" />
        </div>
        <h3 className="text-neutral-200 font-semibold text-lg mb-2">Aucune analyse disponible</h3>
        <p className="text-neutral-400 text-sm">Vos analyses apparaîtront ici une fois créées.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3 bg-[#242424]  rounded-xl">
      <div className="flex items-center justify-between mb-4">
        
        <span className="text-sm text-neutral-300 bg-neutral-800 px-3 py-1 rounded-full">
          {data.length} {data.length > 1 ? 'analyses' : 'analyse'}
        </span>
      </div>
      
      {data.map((item, index) => (
        <div
          key={index}
          className="group relative p-4 rounded-xl border border-neutral-700 bg-neutral-900 hover:shadow-lg hover:shadow-purple-900/20 hover:border-purple-600 transition-all duration-300 ease-in-out"
        >
          <div className="absolute inset-0 bg-linear-to-r from-purple-900/10 to-pink-900/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative flex justify-between items-center">
            <div className="flex gap-4 items-center flex-1">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-neutral-600 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-purple-500/30 transition-shadow duration-300">
                <Cpu size={24} className="text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-neutral-100 font-medium group-hover:text-purple-300 transition-colors duration-200 line-clamp-2">
                  {item.prompt}
                </p>
                <p className="text-xs text-neutral-400 mt-1">Le {item.created_at.split("T")[0]} en {item.created_at.split("T")[1]}</p>
              </div>
            </div>
            
            <button 
              className="ml-4 shrink-0 w-10 h-10 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-purple-900/30 hover:border-purple-500 flex items-center justify-center transition-all duration-200 group-hover:scale-110"
              aria-label="Voir l'analyse"
            >
              <Eye size={20} className="text-neutral-400 group-hover:text-purple-400 transition-colors" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyzTable;