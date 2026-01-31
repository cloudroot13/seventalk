"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BinaryBackground from '@/src/components/BinaryBackground';
import ChatNotifications from '../../src/components/ChatNotifications';

interface User {
  username: string;
  role: string;
}

interface Message {
  id: number;
  text: string;
  user: string;
  time: string;
  userId: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [input, setInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousOnlineUsersRef = useRef<string[]>([]);
  const router = useRouter();

  // API base URL
  const API_URL = typeof window !== 'undefined' ? window.location.origin : '';

  // Função para buscar mensagens
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        
        // Detectar mudanças nos usuários online para notificações
        const newOnlineUsers = data.onlineUsers || [];
        previousOnlineUsersRef.current = newOnlineUsers;
        setOnlineUsers(newOnlineUsers);
        
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setIsConnected(false);
    }
  }, [API_URL]);

  // Adicionar usuário online
  const addOnlineUser = useCallback(async (username: string) => {
    try {
      await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_online_user',
          data: { username }
        })
      });
    } catch (error) {
      console.error('Error adding online user:', error);
    }
  }, [API_URL]);

  // Remover usuário online
  const removeOnlineUser = useCallback(async (username: string) => {
    try {
      await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_online_user',
          data: { username }
        })
      });
    } catch (error) {
      console.error('Error removing online user:', error);
    }
  }, [API_URL]);

  // Enviar mensagem
  const sendMessage = useCallback(async (text: string, username: string) => {
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          data: {
            text,
            user: username,
            userId: username
          }
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [API_URL]);

  useEffect(() => {
    // Verificar autenticação
    const userData = sessionStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Carregar mensagens iniciais
    fetchMessages();
    
    // Adicionar usuário online
    addOnlineUser(parsedUser.username);

    // Polling: buscar novas mensagens a cada 2 segundos
    pollIntervalRef.current = setInterval(fetchMessages, 2000);

    // Verificar conexão
    const connectionInterval = setInterval(() => {
      fetchMessages();
    }, 10000);

    // Cleanup ao sair
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      clearInterval(connectionInterval);
      
      // Remover usuário online
      if (parsedUser) {
        removeOnlineUser(parsedUser.username);
      }
    };
  }, [router, fetchMessages, addOnlineUser, removeOnlineUser]);

  // Scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || isSending) return;

    setIsSending(true);
    const messageText = input.trim();
    setInput('');

    // Enviar para o servidor
    const success = await sendMessage(messageText, user.username);
    
    if (success) {
      // Buscar mensagens atualizadas
      await fetchMessages();
    } else {
      // Se falhar, mostrar erro local
      const errorMsg: Message = {
        id: Date.now(),
        text: "Failed to send message. Please try again.",
        user: "System",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userId: 'system'
      };
      setMessages(prev => [...prev, errorMsg]);
    }
    
    setIsSending(false);
  };

  const handleLogout = () => {
    if (user) {
      removeOnlineUser(user.username);
    }
    sessionStorage.removeItem('user');
    router.push('/');
  };

  const handleClearChat = async () => {
    try {
      await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_chat' })
      });
      await fetchMessages();
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 overflow-hidden">
      <BinaryBackground />
      
      {/* Componente de Notificações */}
      <ChatNotifications 
        currentUser={user.username}
        onlineUsers={onlineUsers}
        newMessages={messages}
      />
      
      {/* Header responsivo */}
      <header className="glass-card mx-2 mt-2 mb-4 sm:mx-4 sm:mt-4 sm:mb-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-gray-900 to-black rounded-lg sm:rounded-xl flex items-center justify-center border border-gray-800">
                <span className="text-gradient font-bold text-sm sm:text-lg">01</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">Cypher Chat</h1>
                <div className="flex items-center gap-2">
                  <p className="text-gray-400 text-xs sm:text-sm truncate">Real-time • Secure</p>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-gray-900/50 rounded-full border border-gray-800">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {onlineUsers.length} online
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearChat}
                  className="cypher-btn text-xs px-3 py-1.5 sm:px-4 sm:py-2"
                  title="Clear chat"
                >
                  <span className="hidden sm:inline">Clear</span>
                  <span className="sm:hidden">🗑️</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="cypher-btn text-xs px-3 py-1.5 sm:px-4 sm:py-2"
                  title="Leave chat"
                >
                  <span className="hidden sm:inline">Leave</span>
                  <span className="sm:hidden">🚪</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Chat principal - ocupa 3 colunas no desktop, full no mobile */}
          <div className="lg:col-span-3">
            <div className="glass-card h-[calc(100vh-160px)] sm:h-[calc(100vh-180px)] flex flex-col">
              {/* Área de mensagens */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                {messages.length === 0 ? (
                  <div className="text-center py-8 sm:py-10">
                    <div className="text-gray-500 text-base sm:text-lg mb-2">No messages yet</div>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Send a message to start the conversation.
                      <br className="hidden sm:block" />
                      Open in another device to test real-time chat.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.userId === user.username ? 'justify-end' : 'justify-start'} fade-in`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                          msg.userId === user.username
                            ? 'bg-linear-to-r from-emerald-900/80 to-emerald-800/80 border border-emerald-800/50 text-white rounded-br-none sm:rounded-br-none'
                            : msg.user === 'System'
                            ? 'bg-gray-900/60 border border-gray-800 text-gray-300'
                            : 'bg-gray-900/40 border border-gray-800 text-gray-100 rounded-bl-none sm:rounded-bl-none'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-1 sm:mb-2">
                            <div className="flex items-center gap-2">
                              {msg.user !== 'System' && msg.userId !== user.username && (
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-linear-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-xs border border-gray-700 shrink-0">
                                  {msg.user.charAt(0)}
                                </div>
                              )}
                              <span className={`text-xs sm:text-sm font-medium ${
                                msg.userId === user.username ? 'text-emerald-300' : 
                                msg.user === 'System' ? 'text-gray-400' : 
                                'text-purple-300'
                              }`}>
                                {msg.user}
                                {msg.userId === user.username && ' (You)'}
                              </span>
                            </div>
                            <span className="text-[10px] sm:text-xs text-gray-500 self-end sm:self-auto">
                              {msg.time}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed wrap-break-word">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input de mensagem - fixo no bottom no mobile */}
              <div className="p-3 sm:p-6 border-t border-gray-800/50">
                <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message as ${user.username}...`}
                    className="cypher-input flex-1 text-sm sm:text-base"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isSending}
                    className="cypher-btn-primary px-4 sm:px-6 text-sm sm:text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Sending...</span>
                      </span>
                    ) : (
                      <>
                        <span className="sm:hidden">📤</span>
                        <span className="hidden sm:inline">Send</span>
                      </>
                    )}
                  </button>
                </form>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-[10px] sm:text-xs text-gray-500">
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <span className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      {isConnected ? 'Connected' : 'Offline'}
                    </span>
                    <span>•</span>
                    <span>Updates every 2s</span>
                    <span>•</span>
                    <span>{messages.length} messages</span>
                  </div>
                  <span className="text-gray-600">Auto-delete on refresh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - escondido no mobile, mostrado no desktop */}
          <div className="hidden lg:block lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Status card */}
            <div className="glass-card p-4 sm:p-6">
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Status</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs sm:text-sm">Connection</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className={`text-xs sm:text-sm ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isConnected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs sm:text-sm">Users Online</span>
                  <span className="text-emerald-400 text-xs sm:text-sm">{onlineUsers.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs sm:text-sm">Messages</span>
                  <span className="text-emerald-400 text-xs sm:text-sm">{messages.length}</span>
                </div>
              </div>
            </div>

            {/* Online Users card */}
            <div className="glass-card p-4 sm:p-6">
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">
                👥 Online ({onlineUsers.length})
              </h3>
              <div className="space-y-2 sm:space-y-3 max-h-60 overflow-y-auto">
                {onlineUsers.map((username) => (
                  <div key={username} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-800/30 rounded-lg sm:rounded-xl transition-colors">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl flex items-center justify-center border border-gray-700 shrink-0">
                      <span className="text-gradient font-medium text-xs sm:text-sm">
                        {username.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-white truncate">
                        {username}
                        {username === user.username && ' (You)'}
                      </p>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                        <p className="text-[10px] sm:text-xs text-gray-400">Online</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info card */}
            <div className="glass-card p-4 sm:p-6 bg-linear-to-br from-gray-900/50 to-black/50">
              <h3 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">How It Works</h3>
              <div className="space-y-2 text-xs sm:text-sm text-gray-400">
                <p>• Messages sync in real-time</p>
                <p>• No registration needed</p>
                <p>• Everything deletes on refresh</p>
                <p>• Uses temporary server memory</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile-only bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 p-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-400">
              {onlineUsers.length} online • {messages.length} msgs
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Tap to send • Swipe to scroll
          </div>
        </div>
      </div>
    </div>
  );
}