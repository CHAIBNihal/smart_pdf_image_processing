import  { useEffect, useState } from 'react';
import type { IUploads } from '../../Interfaces/Upload';
import { getUserUpload } from '../../api/services/uploadService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye } from 'lucide-react';

const UploadTable = () => {
  const [uploads, setUploads] = useState<IUploads[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function getUploads() {
    try {
      const response = await getUserUpload();
      setUploads(response.uploads.slice(0, 6)); // Limite à  6 derniers uploads
    } catch (error) {
      console.error("Erreur lors de la récupération des uploads :", error);
      setError(`Erreur lors de la récupération des uploads:`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUploads();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <div className="text-gray-500 text-center p-4">
        Aucun upload trouvé
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr className="text-left text-xs text-gray-400">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Motif</th>
            <th className="px-4 py-3">Date</th>
            <th className='px-4 py-3'>Détails</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 cursor-pointer">
          {uploads.map((upload) => (
            <tr key={upload.id} className="hover:bg-gray-800/50 transition-colors">
              <td className="px-4 py-3 text-sm text-gray-400">
                <div className="font-medium truncate max-w-37.5" title={upload.motif}>
                  {upload.id.substring(0, 8)}...
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-400">
                {format(new Date(upload.createdAt), 'dd MMM yyyy', { locale: fr })}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                <div className="font-mono truncate max-w-25" title={upload.id}>
                  {upload.motif}
                </div>
              </td>
               <td className="px-4 py-3 text-sm flex justify-start text-gray-500">
                <div className="font-mono truncate max-w-25" title={upload.id}>
                 <Eye size={18}/>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UploadTable;