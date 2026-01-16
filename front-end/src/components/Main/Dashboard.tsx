import { CloudUpload, Cpu, CreditCard } from "lucide-react";
// import { AuthStore } from "../../Store/auth/AuthStore";
import Layout from "../Layout/Layout";
import UploadTable from "../../Ui/Tables/UploadTable";
import AnalyzTable from "../../Ui/Tables/AnalyzTable";

const Dashboard = () => {
  //const { user } = AuthStore();

  return (
    <Layout title="Accueil">
      <div className="">
        <h3 className="text-2xl font-semibold text-slate-400 ">Bienvenue👋</h3>
      </div>
      <section className="border-b mb-3 border-neutral-700 ">
        {/** Plan Upgrade */}
        <div className="border flex justify-between items-center border-neutral-700 rounded-lg p-6 my-6">
          <h2 className="text-lg font-semibold mb-2  text-green-400">
            Passez à un forfait supérieur!
          </h2>
          <button className="bg-linear-to-br h-12  from-blue-500 to-purple-800 hover:from-blue-600 hover:to-purple-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
            <CreditCard size={20} color="white" />
          </button>
        </div>
      </section>
      {/** Last Uploads table */}
      <h2 className="text-lg font-semibold mb-4  text-slate-400">
        Statistiques
      </h2>
      <section className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-3">
        <div className="px-4 py-2 rounded-lg border shadow-sm shadow-neutral-950 border-neutral-700 ">
          <div className="flex justify-between items-center pb-4 pt-1">
            <p className="font-semibold text-start   text-slate-400 pt-1">
              Dernières mises en ligne
            </p>
            <CloudUpload className="text-slate-400" size={20} />
          </div>
          <UploadTable />
        </div>
        <div className="px-4 py-2 rounded-lg border shadow-sm shadow-neutral-950 border-neutral-700 ">
          <div className="flex justify-between items-center pb-4 pt-1">
            <p className="font-semibold text-start   text-slate-400 pt-1">
              Dernières analyses
            </p>
            <Cpu className="text-slate-400" size={20} />
          </div>
          <AnalyzTable />
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
