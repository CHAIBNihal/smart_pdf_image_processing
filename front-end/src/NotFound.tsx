// src/pages/NotFound.tsx
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import notfound from "./assets/NotFound.png";
const NotFound = () => {
  return (
    <div className="min-h-screen  flex items-center justify-center p-6">
      <div className="relative max-w-2xl w-full">
        {/* Effet de particules */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1  rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 7}s`,
              }}
            />
          ))}
        </div>

        <div className="relative bg-black-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50   overflow-hidden">
          {/* Glow effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl" />

          {/* Pattern de fond */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-linear(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="relative p-8 md:p-12">
            {/* Icone animée */}
            <div className="flex justify-center mb-8">
              <img src={notfound} width={350}  />
            </div>

            {/* Code d'erreur stylisé */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Page introuvable
              </h1>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 transform"
              >
                <Home className="w-5 h-5" color="white" />
                <span className="text-white">Retour à l'accueil</span>
                <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-white/40 transition-colors" />
              </Link>

              <button
                onClick={() => window.history.back()}
                className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-gray-800/80 text-gray-300 font-medium rounded-xl border border-gray-700 shadow-lg shadow-black/20 hover:shadow-black/30 hover:bg-gray-800 transition-all duration-300 hover:scale-105 transform"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Page précédente</span>
                <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-gray-600 transition-colors" />
              </button>
            </div>

            {/* Section contact */}
            <div className="mt-8 pt-8 border-t border-gray-800 text-center">
              <p className="text-gray-500 text-sm">
                Si vous pensez qu'il s'agit d'une erreur, contactez-nous à{" "}
                <a
                  href="mailto:support@example.com"
                  className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                >
                  support.aidocs@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Bottom linear */}
          <div className="h-1 bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} AIDocs. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
