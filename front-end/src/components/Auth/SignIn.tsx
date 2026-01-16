import  { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { AuthStore } from '../../Store/auth/AuthStore';
import { loginWithGoogle } from '../../api/services/authService';

function SignIn() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = AuthStore();
  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.email || !form.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await login(form.email, form.password);
      if (!res) {
        setError("Erreur lors de la connexion. Vérifiez vos identifiants.");
        throw new Error("Login failed")
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Login Successfully");
    } catch (err) {
      setError("Erreur lors de la connexion. Vérifiez vos identifiants.");
    } finally {
      setIsLoggingIn(false);
      setForm({ email: "", password: "" });
    }
  };

  const handleGoogleLogin = () => {
    try {
      setIsLoggingIn(true);
      // This will redirect to Google OAuth, no need to wait
      loginWithGoogle();
    } catch (error) {
      setError("Erreur lors de la connexion. Vérifiez vos identifiants.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen  flex">
      {/* Section Image - Cachée sur mobile */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-indigo-700">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
          </div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-16 w-full">
          <div className="max-w-md space-y-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-700 rounded-xl">
                <p className='flex justify-center items-center p-1 text-2xl font-bold'>AD</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              Bienvenue sur AIDoc
            </h2>
            <p className="text-lg text-blue-100">
              Votre assistant intelligent pour Analyser et gérer vos documents pdf + images .
            </p>
            <div className="space-y-4 pt-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-blue-50">Analyse de documents médicaux en temps réel</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-blue-50">Sécurité et confidentialité garanties</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-blue-50">Extraire le texte d'une image</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Formulaire */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl mb-4 shadow-lg lg:hidden">
              <div className="w-10 h-10  rounded-xl"></div>
            </div>
            <h1 className="text-3xl font-bold text-gray-200 mb-2">
              Connexion
            </h1>
            <p className="text-neutral-200">
              Accédez à votre espace AIDoc
            </p>
          </div>

          {/* Formulaire */}
          <div className="space-y-5">
            {/* Message d'erreur */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {error}
                </p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="votre@email.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-neutral-700 text-neutral-100"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez votre mot de passe"
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-neutral-600 text-neutral-100"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton de connexion */}
            <button
              onClick={handleSubmit}
              disabled={isLoggingIn}
              className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white py-3.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg shadow-blue-500/30"
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connexion en cours...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>

            {/* Séparateur */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            {/* Connexion Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-3.5 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition font-medium"
            >
              <FcGoogle className="w-5 h-5" />
              Continuer avec Google
            </button>

            {/* Lien inscription */}
            <div className="text-center pt-4">
              <p className="text-gray-600">
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition"
                >
                  Créer un compte
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SignIn;