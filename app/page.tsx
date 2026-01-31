"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BinaryBackground from '@/src/components/BinaryBackground';

// USUÁRIOS ATUALIZADOS (com Anonymous):
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
  const [showPasswords, setShowPasswords] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const router = useRouter();

  // Verificar se já está logado (redirecionar se sim)
  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (user) {
      router.push('/chat');
    }
  }, [router]);

  // Auto-preencher quando selecionar um usuário
  useEffect(() => {
    if (selectedUser) {
      const user = ALLOWED_USERS.find(u => u.username === selectedUser);
      if (user) {
        setUsername(user.username);
        setPassword(user.password);
        setError('');
      }
    }
  }, [selectedUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));

    // DEBUG: Para ver o que está acontecendo
    console.log('=== DEBUG LOGIN ===');
    console.log('Tentando login:', { username, password });
    
    // Buscar usuário (case-insensitive no username, case-sensitive na senha)
    const user = ALLOWED_USERS.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && 
           u.password === password
    );

    console.log('Usuário encontrado:', user);

    if (user) {
      console.log('✅ Login bem-sucedido para:', user.username);
      
      // Salvar no sessionStorage
      sessionStorage.setItem('user', JSON.stringify(user));
      
      // Também salvar no localStorage para persistência opcional
      localStorage.setItem('lastLoggedUser', user.username);
      
      // Redirecionar para o chat
      router.push('/chat');
    } else {
      console.log('❌ Login falhou. Verificando cada usuário...');
      
      // Debug detalhado
      ALLOWED_USERS.forEach(u => {
        const usernameMatch = u.username.toLowerCase() === username.trim().toLowerCase();
        const passwordMatch = u.password === password;
        console.log(`${u.username}: usernameMatch=${usernameMatch}, passwordMatch=${passwordMatch}`);
      });
      
      setError(`Access denied. Invalid credentials.`);
      setLoading(false);
    }
  };

  const handleQuickSelect = (user: typeof ALLOWED_USERS[0]) => {
    setSelectedUser(user.username);
    setUsername(user.username);
    setPassword(user.password);
    setError('');
  };

  // Função para copiar senha
  const copyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    setError('Password copied to clipboard!');
    setTimeout(() => setError(''), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-y-auto">
      <BinaryBackground />
      
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[50px_50px] -z-5"></div>
      
      <div className="glass-card max-w-md w-full p-6 md:p-8 slide-up my-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-linear-to-br from-gray-900 to-black rounded-2xl mb-6 border border-gray-800 glow">
            <span className="text-2xl md:text-3xl text-gradient font-bold">01</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">Cypher Chat</h1>
          <p className="text-gray-400 text-sm md:text-base">End-to-end encrypted messaging</p>
          <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-gray-900/50 rounded-full border border-gray-800">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Messages auto-delete on exit</span>
          </div>
        </div>

        {/* Seletor rápido de usuários */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Login:</h3>
          <div className="grid grid-cols-2 gap-2">
            {ALLOWED_USERS.map((user) => (
              <button
                key={user.username}
                type="button"
                onClick={() => handleQuickSelect(user)}
                className={`cypher-btn-secondary text-xs py-2 ${selectedUser === user.username ? 'bg-gray-800' : ''}`}
              >
                {user.username}
                {user.role === 'admin' && ' 👑'}
                {user.role === 'anonymous' && ' 👤'}
              </button>
            ))}
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
                onChange={(e) => {
                  setUsername(e.target.value);
                  setSelectedUser(null);
                }}
                className="cypher-input w-full"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="text-xs text-gray-400 hover:text-gray-300"
                >
                  {showPasswords ? 'Hide' : 'Show'} Passwords
                </button>
              </div>
              <input
                type={showPasswords ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cypher-input w-full"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {/* Mostrar senhas se ativado */}
          {showPasswords && (
            <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Available Passwords:</h4>
              <div className="space-y-2">
                {ALLOWED_USERS.map((user) => (
                  <div key={user.username} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{user.username}:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-800 px-2 py-1 rounded">
                        {user.password}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyPassword(user.password)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className={`bg-${error.includes('copied') ? 'blue' : 'red'}-900/20 border border-${error.includes('copied') ? 'blue' : 'red'}-800/50 rounded-xl p-4 fade-in`}>
              <div className="flex items-center gap-2">
                <span className={error.includes('copied') ? "text-blue-400" : "text-red-400"}>
                  {error.includes('copied') ? "✓" : "⚠"}
                </span>
                <p className={error.includes('copied') ? "text-blue-300 text-sm" : "text-red-300 text-sm"}>
                  {error}
                </p>
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

        <div className="mt-8 pt-6 border-t border-gray-800/50">
          <div className="text-center space-y-3">
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {ALLOWED_USERS.map((user) => (
                <span 
                  key={user.username}
                  className={`px-2 py-1 rounded text-xs ${selectedUser === user.username ? 'bg-gray-800 text-white' : 'bg-gray-900/50 text-gray-300'}`}
                >
                  {user.username}
                  {user.role === 'admin' && ' 👑'}
                </span>
              ))}
            </div>
            <div className="text-gray-400 text-xs">
              <p className="mb-1">Test credentials (click Quick Login above):</p>
              <div className="text-gray-500 text-[11px] leading-tight">
                <p><span className="text-gray-400">Admin:</span> cloud / opwh7js8f2</p>
                <p><span className="text-gray-400">Users:</span> pazzyne / 1Li3ycKlfu • flux / TwxGOr:064</p>
                <p><span className="text-gray-400">Guest:</span> Anonymous / opwh7js8f2</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-600 flex-wrap">
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
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                Auto-wipe
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-gray-600 text-xs">
          Messages are stored temporarily in memory • All data wiped on server restart
        </p>
      </div>
    </div>
  );
}