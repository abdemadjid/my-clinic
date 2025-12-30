// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, action: 'login' }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        {/* Animated Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Icon Animation */}
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="relative inline-block">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-white rounded-3xl blur-2xl opacity-50 animate-pulse-slow"></div>
              
              {/* Icon Container */}
              <div className="relative w-24 h-24 mx-auto mb-6 transform hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-100 rounded-3xl animate-spin-slow"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <svg className="w-14 h-14 text-white animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">
              Clinic Manager
            </h1>
            <p className="text-blue-100 text-lg animate-fade-in" style={{ animationDelay: '100ms' }}>
              Bienvenue de retour ! 👋
            </p>
          </div>

          {/* Card */}
          <div className="relative group animate-scale-in" style={{ animationDelay: '200ms' }}>
            {/* Card Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse-slow"></div>
            
            {/* Card Content */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

              {/* Header Decoration */}
              <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>

              {/* Form */}
              <form onSubmit={handleLogin} className="relative p-8 space-y-6">
                {/* Error Alert */}
                {error && (
                  <div className="animate-shake bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-red-500 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover/input:opacity-20 transition-opacity blur"></div>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="relative w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="admin@clinic.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Mot de passe
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover/input:opacity-20 transition-opacity blur"></div>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="relative w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-gray-400 hover:text-purple-600 transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full group/btn overflow-hidden rounded-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-transform group-hover/btn:scale-105"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover/btn:opacity-100 transition-opacity blur"></div>
                  <div className="relative py-4 text-white font-bold text-lg flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Connexion en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>Se connecter</span>
                        <svg className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Footer */}
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 px-8 py-5 border-t border-gray-100">
                <p className="text-center text-sm text-gray-600 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Système sécurisé avec chiffrement
                </p>
              </div>
            </div>
          </div>

          {/* Demo Credentials Card */}
          <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="relative group/demo">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-50 group-hover/demo:opacity-75 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-5 border border-green-200 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover/demo:rotate-12 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                      🔑 Identifiants de démonstration
                    </p>
                    <div className="space-y-1 text-xs">
                      <p className="text-gray-700"><span className="font-semibold">Email:</span> admin@clinic.com</p>
                      <p className="text-gray-700"><span className="font-semibold">Mot de passe:</span> admin123</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <p className="text-center text-white/80 text-sm mt-8 animate-fade-in" style={{ animationDelay: '600ms' }}>
            © 2024 Clinic Manager • Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}