"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BinaryBackground from '@/src/components/BinaryBackground';

// No app/page.tsx, atualize ALLOWED_USERS:
const ALLOWED_USERS = [
  { username: "pazzyne", password: "suaSenha123", role: "admin" },
  { username: "Amigo1", password: "amigo123", role: "user" },
  { username: "Anonymous", password: "opwh7js8f2", role: "anonymous" }
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    const user = ALLOWED_USERS.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
      router.push('/chat');
    } else {
      setError('Access denied. Invalid credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <BinaryBackground />
      
      {/* Efeito de grade sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[50px_50px] -z-5"></div>
      
      <div className="glass-card max-w-md w-full p-8 slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-gray-900 to-black rounded-2xl mb-6 border border-gray-800 glow">
            <span className="text-3xl text-gradient font-bold">01</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Cypher Chat</h1>
          <p className="text-gray-400">End-to-end encrypted messaging</p>
          <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-gray-900/50 rounded-full border border-gray-800">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Messages auto-delete on exit</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="cypher-input w-full"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cypher-input w-full"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 fade-in">
              <div className="flex items-center gap-2">
                <span className="text-red-400">⚠</span>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cypher-btn-primary w-full flex items-center justify-center gap-3 py-4"
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
        </form>

        <div className="mt-10 pt-6 border-t border-gray-800/50">
          <div className="text-center space-y-3">
            <p className="text-gray-500 text-sm">
              Demo credentials: <span className="text-gray-300">Anonymous / opwh7js8f2</span>
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                Encrypted
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                Private
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                Secure
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}