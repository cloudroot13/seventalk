"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BinaryBackground from '@/src/components/BinaryBackground';

const ALLOWED_USERS = [
  { username: "pazzyne", password: "1Li3ycKlfu", role: "user" },
  { username: "flux", password: "TwxGOr:064", role: "user" },
  { username: "cloud", password: "opwh7js8f2", role: "admin" },
  { username: "Anonymous", password: "opwh7js8f2", role: "anonymous" }
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (user) {
      router.push('/chat');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    console.log('=== DEBUG LOGIN ===');
    console.log('Input:', { username, password });
    
    const user = ALLOWED_USERS.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && 
           u.password === password
    );

    console.log('Usuário encontrado:', user);

    if (user) {
      console.log('✅ Login bem-sucedido para:', user.username);
      sessionStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('lastLoggedUser', user.username);
      router.push('/chat');
    } else {
      console.log('❌ Login falhou.');
      setError(`Access denied. Invalid credentials.`);
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleDemoFill = () => {
    // Apenas preenche com dados de demonstração, mas NÃO faz login automático
    const demoUser = ALLOWED_USERS[0]; // pazzyne
    setUsername(demoUser.username);
    setPassword(demoUser.password);
    setError('Demo credentials filled. Click "Access Secure Chat" to login.');
  };

  return (
    <div className="min-h-screen-mobile flex items-center justify-center p-4 relative overflow-y-auto">
      <BinaryBackground />
      
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[50px_50px] -z-5"></div>
      
      <div className="glass-card max-w-md w-full p-6 md:p-8 slide-up my-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-linear-to-br from-gray-900 to-black rounded-2xl mb-6 border border-gray-800 glow">
            <span className="text-2xl md:text-3xl text-gradient font-bold">01</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">Cypher Chat</h1>
          <p className="text-gray-400 text-sm md:text-base">Restricted Access • Authorized Users Only</p>
          <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-gray-900/50 rounded-full border border-gray-800">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Secure authentication required</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Username
                </label>
                <span className="text-xs text-gray-500">
                  {ALLOWED_USERS.length} authorized users
                </span>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="cypher-input w-full no-zoom"
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cypher-input w-full no-zoom"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className={`bg-${error.includes('Demo') ? 'blue' : 'red'}-900/20 border border-${error.includes('Demo') ? 'blue' : 'red'}-800/50 rounded-xl p-4 fade-in`}>
              <div className="flex items-center gap-2">
                <span className={error.includes('Demo') ? "text-blue-400" : "text-red-400"}>
                  {error.includes('Demo') ? "ℹ️" : "⚠️"}
                </span>
                <p className={error.includes('Demo') ? "text-blue-300 text-sm" : "text-red-300 text-sm"}>
                  {error}
                </p>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              className="cypher-btn-primary w-full flex items-center justify-center gap-3 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>🔐</span>
                  <span>Access Secure Chat</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800/50">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Authorized Users</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {ALLOWED_USERS.map((user) => (
                  <div 
                    key={user.username}
                    className="bg-gray-900/40 border border-gray-800 rounded-lg px-3 py-2"
                  >
                    <div className="text-xs text-gray-300">{user.username}</div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      Role: <span className={user.role === 'admin' ? 'text-purple-400' : 'text-gray-400'}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-gray-500 text-xs leading-relaxed">
              <p className="mb-2">⚠️ Access is restricted to authorized personnel only.</p>
              <p className="text-gray-600">
                Contact administrator for credentials. Unauthorized access attempts are logged.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-gray-600 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                End-to-end encrypted
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                Auto-wipe on exit
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-gray-600 text-xs px-4">
          Strict authentication required • All access attempts are monitored
        </p>
      </div>
    </div>
  );
}