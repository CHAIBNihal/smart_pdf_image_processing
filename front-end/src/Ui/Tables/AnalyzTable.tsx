import React, { useCallback, useEffect, useState } from "react";
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
      if (user?.sub) {
        const res = await getAnalyseByClientId(user.sub);
        setData(res);
      } else {
        setError("Id client est introuvable !");
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
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-600 border-r-purple-600 absolute top-0 left-0"></div>
        </div>
        <p className="text-neutral-400 text-sm font-medium">Chargement des analyses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-6 rounded-xl bg-red-50 border border-red-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-xl">⚠</span>
          </div>
          <div>
            <h3 className="text-red-800 font-semibold">Erreur</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="mt-6 p-12 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-200 flex items-center justify-center">
          <Sparkles size={28} className="text-neutral-400" />
        </div>
        <h3 className="text-neutral-700 font-semibold text-lg mb-2">Aucune analyse disponible</h3>
        <p className="text-neutral-500 text-sm">Vos analyses apparaîtront ici une fois créées.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-800">Mes Analyses</h2>
        <span className="text-sm text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
          {data.length} {data.length > 1 ? 'analyses' : 'analyse'}
        </span>
      </div>
      
      {data.map((item, index) => (
        <div
          key={index}
          className="group relative p-4 rounded-xl border border-neutral-200 bg-white hover:shadow-lg hover:border-purple-300 transition-all duration-300 ease-in-out"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative flex justify-between items-center">
            <div className="flex gap-4 items-center flex-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                <Cpu size={24} className="text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-neutral-800 font-medium group-hover:text-purple-700 transition-colors duration-200 line-clamp-2">
                  {item.prompt}
                </p>
                <p className="text-xs text-neutral-400 mt-1">Analyse #{index + 1}</p>
              </div>
            </div>
            
            <button 
              className="ml-4 flex-shrink-0 w-10 h-10 rounded-lg border border-neutral-300 bg-white hover:bg-purple-50 hover:border-purple-400 flex items-center justify-center transition-all duration-200 group-hover:scale-110"
              aria-label="Voir l'analyse"
            >
              <Eye size={20} className="text-neutral-600 group-hover:text-purple-600 transition-colors" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyzTable;