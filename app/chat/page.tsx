"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BinaryBackground from '@/src/components/BinaryBackground';

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
  isOwn?: boolean;
}

// Canal de comunicação entre abas
const CHAT_CHANNEL = 'cypher_chat_channel';
const ONLINE_USERS_CHANNEL = 'cypher_online_users';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [input, setInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatChannelRef = useRef<BroadcastChannel | null>(null);
  const onlineChannelRef = useRef<BroadcastChannel | null>(null);
  const router = useRouter();

  // Função para enviar mensagem para outras abas
  const broadcastMessage = useCallback((message: Message) => {
    if (chatChannelRef.current) {
      chatChannelRef.current.postMessage({
        type: 'NEW_MESSAGE',
        message
      });
    }
  }, []);

  // Função para atualizar lista de usuários online
  const broadcastOnlineUsers = useCallback((users: string[]) => {
    if (onlineChannelRef.current) {
      onlineChannelRef.current.postMessage({
        type: 'UPDATE_ONLINE_USERS',
        users
      });
    }
  }, []);

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Inicializar canais de broadcast
    chatChannelRef.current = new BroadcastChannel(CHAT_CHANNEL);
    onlineChannelRef.current = new BroadcastChannel(ONLINE_USERS_CHANNEL);

    // Carregar mensagens do localStorage (backup)
    const savedMessages = localStorage.getItem('chat_messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (e) {
        console.error('Error loading messages:', e);
      }
    }

    // Adicionar usuário à lista online
    const online = JSON.parse(localStorage.getItem('online_users') || '[]');
    if (!online.includes(parsedUser.username)) {
      const newOnline = [...online, parsedUser.username];
      localStorage.setItem('online_users', JSON.stringify(newOnline));
      setOnlineUsers(newOnline);
      broadcastOnlineUsers(newOnline);
    } else {
      setOnlineUsers(online);
    }

    // Ouvir novas mensagens de outras abas
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'NEW_MESSAGE') {
        const newMessage = event.data.message;
        setMessages(prev => {
          // Evitar duplicatas
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev;
          }
          const updated = [...prev, newMessage];
          // Salvar backup no localStorage
          localStorage.setItem('chat_messages', JSON.stringify(updated));
          return updated;
        });
      }
    };

    // Ouvir atualizações de usuários online
    const handleOnlineUsers = (event: MessageEvent) => {
      if (event.data.type === 'UPDATE_ONLINE_USERS') {
        setOnlineUsers(event.data.users);
        localStorage.setItem('online_users', JSON.stringify(event.data.users));
      }
    };

    chatChannelRef.current.addEventListener('message', handleMessage);
    onlineChannelRef.current.addEventListener('message', handleOnlineUsers);

    // Pedir atualização de estado quando entrar
    if (onlineChannelRef.current) {
      onlineChannelRef.current.postMessage({
        type: 'REQUEST_ONLINE_USERS'
      });
    }

    // Responder a pedidos de estado
    const handleRequest = (event: MessageEvent) => {
      if (event.data.type === 'REQUEST_ONLINE_USERS') {
        const currentOnline = JSON.parse(localStorage.getItem('online_users') || '[]');
        broadcastOnlineUsers(currentOnline);
      }
    };

    onlineChannelRef.current.addEventListener('message', handleRequest);

    // Cleanup
    return () => {
      if (chatChannelRef.current) {
        chatChannelRef.current.removeEventListener('message', handleMessage);
        chatChannelRef.current.close();
      }
      if (onlineChannelRef.current) {
        onlineChannelRef.current.removeEventListener('message', handleOnlineUsers);
        onlineChannelRef.current.removeEventListener('message', handleRequest);
        onlineChannelRef.current.close();
      }

      // Remover usuário da lista online ao sair
      const online = JSON.parse(localStorage.getItem('online_users') || '[]');
      const filtered = online.filter((u: string) => u !== parsedUser.username);
      localStorage.setItem('online_users', JSON.stringify(filtered));
      broadcastOnlineUsers(filtered);
    };
  }, [router, broadcastOnlineUsers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !user) return;

    const newMessage: Message = {
      id: Date.now(),
      text,
      user: user.username,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userId: user.username,
      isOwn: true
    };

    // Adicionar ao estado local
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // Salvar no localStorage (backup)
    localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
    
    // Enviar para outras abas
    broadcastMessage(newMessage);
    
    setInput('');
  };

  const handleLogout = () => {
    if (user) {
      const online = JSON.parse(localStorage.getItem('online_users') || '[]');
      const filtered = online.filter((u: string) => u !== user.username);
      localStorage.setItem('online_users', JSON.stringify(filtered));
      broadcastOnlineUsers(filtered);
    }
    sessionStorage.removeItem('user');
    router.push('/');
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('chat_messages');
    
    // Mensagem de sistema
    const systemMsg: Message = {
      id: Date.now(),
      text: "Chat cleared. All messages have been removed.",
      user: "System",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userId: 'system'
    };
    
    setMessages([systemMsg]);
    localStorage.setItem('chat_messages', JSON.stringify([systemMsg]));
    broadcastMessage(systemMsg);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 overflow-hidden">
      <BinaryBackground />
      
      <header className="glass-card mx-4 mt-4 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-gray-900 to-black rounded-xl flex items-center justify-center border border-gray-800">
                  <span className="text-gradient font-bold text-lg">01</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Cypher Chat</h1>
                  <p className="text-gray-400 text-sm">Real-time • Private • Multi-tab</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-900/50 rounded-full border border-gray-800">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">
                  {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearChat}
                className="cypher-btn text-sm px-4 py-2"
              >
                🗑️ Clear All
              </button>
              <button
                onClick={handleLogout}
                className="cypher-btn text-sm px-4 py-2"
              >
                🔓 Leave
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat principal */}
          <div className="lg:col-span-3">
            <div className="glass-card h-[calc(100vh-180px)] flex flex-col">
              {/* Área de mensagens */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="text-gray-500 text-lg mb-2">No messages yet</div>
                      <p className="text-gray-600 text-sm">
                        Send a message to start the conversation.
                        <br />
                        Open another tab with a different user to test real-time chat.
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.userId === user.username ? 'justify-end' : 'justify-start'} fade-in`}
                        >
                          <div className={`message-bubble ${
                            msg.userId === user.username
                              ? 'bg-linear-to-r from-emerald-900/80 to-emerald-800/80 border border-emerald-800/50 text-white rounded-br-none glow'
                              : msg.user === 'System'
                              ? 'bg-gray-900/60 border border-gray-800 text-gray-300'
                              : 'bg-gray-900/40 border border-gray-800 text-gray-100 rounded-bl-none'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {msg.user !== 'System' && msg.userId !== user.username && (
                                  <div className="w-6 h-6 bg-linear-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-xs border border-gray-700">
                                    {msg.user.charAt(0)}
                                  </div>
                                )}
                                <span className={`text-sm font-medium ${
                                  msg.userId === user.username ? 'text-emerald-300' : 
                                  msg.user === 'System' ? 'text-gray-400' : 
                                  'text-purple-300'
                                }`}>
                                  {msg.user}
                                  {msg.userId === user.username ? ' (You)' : ''}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">{msg.time}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input de mensagem */}
              <div className="p-6 border-t border-gray-800/50">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(input);
                }} className="flex gap-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message as ${user.username}...`}
                    className="cypher-input flex-1"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="cypher-btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </form>
                <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>🌐 Real-time between tabs</span>
                    <span>🗑️ Clears on refresh</span>
                  </div>
                  <span>{messages.length} messages</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Online Users card */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">
                👥 Online Now ({onlineUsers.length})
              </h3>
              <div className="space-y-3">
                {onlineUsers.map((username) => (
                  <div key={username} className="flex items-center gap-3 p-3 hover:bg-gray-800/30 rounded-xl transition-colors">
                    <div className="w-10 h-10 bg-linear-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center border border-gray-700">
                      <span className="text-gradient font-medium">
                        {username.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {username}
                        {username === user.username && ' (You)'}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                        <p className="text-xs text-gray-400">Connected</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions card */}
            <div className="glass-card p-6 bg-linear-to-br from-gray-900/50 to-black/50">
              <h3 className="font-semibold text-white mb-3">How to Test</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-emerald-400">1</span>
                  </div>
                  <span>Open this site in another browser tab</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-emerald-400">2</span>
                  </div>
                  <span>Login with a different user (Neo, Trinity, etc.)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-emerald-400">3</span>
                  </div>
                  <span>Send messages - they appear in both tabs instantly</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-800/50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gray-400">!</span>
                  </div>
                  <span>Refresh any tab to clear chat history</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}