"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BinaryBackground from '@/src/components/BinaryBackground';
import ChatNotifications from '@/src/components/ChatNotifications';
import UserActivityTracker from '@/src/components/UserActivityTracker';
import { useMobileZoomFix } from '@/src/hooks/useMobileZoomFix';

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
  const [hasAddedUser, setHasAddedUser] = useState(false);
  const [clearedUsers, setClearedUsers] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousOnlineUsersRef = useRef<string[]>([]);
  const hasInitializedRef = useRef(false);
  const lastMessageIdRef = useRef<number>(0);
  const pendingMessagesRef = useRef<Message[]>([]);
  const router = useRouter();

  // 🆕 Aplica fix para zoom no mobile
  useMobileZoomFix();

  // API base URL
  const API_URL = typeof window !== 'undefined' ? window.location.origin : '';

  const fetchMessages = useCallback(async (force = false) => {
    try {
      const response = await fetch(`${API_URL}/api/chat?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const serverMessages: Message[] = data.messages || [];
        
        if (serverMessages.length > 0) {
          const lastServerMsgId = Math.max(...serverMessages.map((m: Message) => m.id));
          
          if (force || lastServerMsgId > lastMessageIdRef.current) {
            const allMessages = [...pendingMessagesRef.current];
            
            serverMessages.forEach((serverMsg: Message) => {
              if (!allMessages.some(m => m.id === serverMsg.id)) {
                allMessages.push(serverMsg);
              }
            });
            
            allMessages.sort((a, b) => a.id - b.id);
            
            lastMessageIdRef.current = Math.max(...allMessages.map(m => m.id));
            
            pendingMessagesRef.current = pendingMessagesRef.current.filter(
              pendingMsg => !serverMessages.some(serverMsg => serverMsg.id === pendingMsg.id)
            );
            
            setMessages(allMessages);
            lastMessageIdRef.current = lastServerMsgId;
          }
        }
        
        const newOnlineUsers = data.onlineUsers || [];
        if (JSON.stringify(newOnlineUsers) !== JSON.stringify(previousOnlineUsersRef.current)) {
          setOnlineUsers(newOnlineUsers);
          previousOnlineUsersRef.current = newOnlineUsers;
        }
        
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setIsConnected(false);
    }
  }, [API_URL]);

  const handleUserMessagesCleared = useCallback((username: string) => {
    console.log(`🧹 Mensagens de ${username} foram limpas por inatividade`);
    setClearedUsers(prev => [...prev, username]);
    setMessages(prev => prev.filter(msg => msg.user !== username));
    
    setTimeout(() => {
      setClearedUsers(prev => prev.filter(user => user !== username));
    }, 5000);
  }, []);

  const addOnlineUser = useCallback(async (username: string) => {
    if (hasAddedUser) {
      console.log('⏭️ Usuário já adicionado, pulando:', username);
      return;
    }
    
    try {
      await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          action: 'add_online_user',
          data: { username }
        })
      });
      setHasAddedUser(true);
      console.log('✅ Usuário adicionado online:', username);
    } catch (error) {
      console.error('Error adding online user:', error);
    }
  }, [API_URL, hasAddedUser]);

  const removeOnlineUser = useCallback(async (username: string) => {
    try {
      await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          action: 'remove_online_user',
          data: { username }
        })
      });
      setHasAddedUser(false);
      console.log('✅ Usuário removido online:', username);
    } catch (error) {
      console.error('Error removing online user:', error);
    }
  }, [API_URL]);

  const sendMessage = useCallback(async (text: string, username: string): Promise<boolean> => {
    try {
      const messageId = Date.now();
      const tempMessage: Message = {
        id: messageId,
        text,
        user: username,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userId: username
      };
      
      setMessages(prev => [...prev, tempMessage]);
      pendingMessagesRef.current.push(tempMessage);
      lastMessageIdRef.current = messageId;
      
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          action: 'send_message',
          data: {
            text,
            user: username,
            userId: username
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const confirmedMessage = data.message as Message;
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...confirmedMessage, id: messageId } : msg
          )
        );
        
        pendingMessagesRef.current = pendingMessagesRef.current.filter(m => m.id !== messageId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [API_URL]);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    
    const userData = sessionStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    console.log('🔄 Iniciando chat para usuário:', parsedUser.username);
    hasInitializedRef.current = true;

    fetchMessages(true);
    
    if (parsedUser.username && !hasAddedUser) {
      setTimeout(() => addOnlineUser(parsedUser.username), 500);
    }

    pollIntervalRef.current = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    const connectionCheck = setInterval(() => {
      fetch(`${API_URL}/api/chat?ping=1`)
        .then(res => setIsConnected(res.ok))
        .catch(() => setIsConnected(false));
    }, 15000);

    return () => {
      console.log('🧹 Limpando recursos do chat');
      
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      
      clearInterval(connectionCheck);
      
      if (parsedUser.username && hasAddedUser) {
        console.log('🚪 Removendo usuário no cleanup:', parsedUser.username);
        removeOnlineUser(parsedUser.username);
      }
      
      hasInitializedRef.current = false;
      pendingMessagesRef.current = [];
      lastMessageIdRef.current = 0;
    };
  }, [router, API_URL]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || isSending) return;

    setIsSending(true);
    const messageText = input.trim();
    setInput('');

    console.log('✉️ Enviando mensagem:', { user: user.username, text: messageText });
    
    const success = await sendMessage(messageText, user.username);
    
    if (!success) {
      console.error('❌ Falha ao enviar mensagem');
      const errorMsg: Message = {
        id: Date.now(),
        text: "Failed to send message. Please try again.",
        user: "System",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userId: 'system'
      };
      setMessages(prev => [...prev, errorMsg]);
    } else {
      console.log('✅ Mensagem enviada com sucesso');
    }
    
    setIsSending(false);
  };

  const handleLogout = () => {
    console.log('👋 Logout solicitado para:', user?.username);
    if (user && hasAddedUser) {
      removeOnlineUser(user.username);
    }
    sessionStorage.removeItem('user');
    localStorage.removeItem('lastLoggedUser');
    router.push('/');
  };

  const handleClearChat = async () => {
    if (!window.confirm('Clear all messages? This action cannot be undone.')) {
      return;
    }
    
    try {
      console.log('🧹 Solicitando limpeza do chat');
      await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ action: 'clear_chat' })
      });
      
      setMessages([]);
      pendingMessagesRef.current = [];
      lastMessageIdRef.current = 0;
      
      console.log('✅ Chat limpo com sucesso');
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen-mobile bg-gray-950 text-gray-100 overflow-hidden">
      <BinaryBackground />
      
      <UserActivityTracker
        username={user.username}
        isOnline={onlineUsers.includes(user.username)}
        apiUrl={API_URL}
        onUserMessagesCleared={handleUserMessagesCleared}
      />
      
      <ChatNotifications 
        currentUser={user.username}
        onlineUsers={onlineUsers}
        newMessages={messages}
      />
      
      {clearedUsers.length > 0 && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-amber-900/80 border border-amber-700/50 rounded-lg p-3 z-50 max-w-sm">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">⏰</span>
            <p className="text-sm text-white">
              {clearedUsers[clearedUsers.length - 1]}'s messages were cleared (inactive &gt; 10min)
            </p>
          </div>
        </div>
      )}
      
      <header className={`glass-card mx-0 sm:mx-3 md:mx-4 mt-0 sm:mt-3 md:mt-4 mb-2 sm:mb-4 md:mb-6 transition-all duration-300 ${
        isInputFocused ? 'opacity-70 scale-95' : 'opacity-100'
      }`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3">
            <div className="flex items-center gap-2 xs:gap-3 w-full xs:w-auto">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-linear-to-br from-gray-900 to-black rounded-xl sm:rounded-2xl flex items-center justify-center border border-gray-800 shrink-0">
                <span className="text-gradient font-bold text-sm sm:text-base md:text-lg">01</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                  Cypher Chat
                </h1>
                <div className="flex items-center gap-1 xs:gap-2">
                  <p className="text-gray-400 text-xs sm:text-sm truncate">
                    {user.username} • {user.role}
                  </p>
                  <div className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between xs:justify-end gap-2 w-full xs:w-auto mt-1 xs:mt-0">
              <div className="flex items-center gap-1 xs:gap-2 px-2 xs:px-3 py-1 bg-gray-900/50 rounded-full border border-gray-800">
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                  {onlineUsers.length} online
                </span>
              </div>
              
              <div className="flex items-center gap-1 xs:gap-2">
                <button
                  onClick={handleClearChat}
                  className="cypher-btn text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                  title="Clear chat"
                >
                  <span className="hidden xs:inline">Clear</span>
                  <span className="xs:hidden">🗑️</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="cypher-btn text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                  title="Leave chat"
                >
                  <span className="hidden xs:inline">Leave</span>
                  <span className="xs:hidden">🚪</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-0 sm:px-3 md:px-4 pb-4 sm:pb-6 md:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          <div className="lg:col-span-3">
            <div className={`glass-card h-[calc(100dvh-120px)] sm:h-[calc(100dvh-160px)] md:h-[calc(100dvh-180px)] flex flex-col overflow-hidden transition-all duration-300 ${
              isInputFocused ? 'h-[calc(100dvh-180px)] sm:h-[calc(100dvh-200px)]' : ''
            }`}>
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 touch-scroll no-scrollbar"
              >
                {messages.length === 0 ? (
                  <div className="text-center py-8 sm:py-10">
                    <div className="text-gray-500 text-base sm:text-lg mb-2">
                      No messages yet
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm px-2">
                      Send a message to start the conversation.
                      <br />
                      Open in another device to test real-time chat.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={`msg-${msg.id}-${msg.time}`}
                        className={`flex ${msg.userId === user.username ? 'justify-end' : 'justify-start'} fade-in`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                          msg.userId === user.username
                            ? 'bg-linear-to-r from-emerald-900/80 to-emerald-800/80 border border-emerald-800/50 text-white rounded-br-none sm:rounded-br-none'
                            : msg.user === 'System'
                            ? 'bg-gray-900/60 border border-gray-800 text-gray-300'
                            : 'bg-gray-900/40 border border-gray-800 text-gray-100 rounded-bl-none sm:rounded-bl-none'
                        }`}>
                          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 xs:gap-2 mb-1 xs:mb-2">
                            <div className="flex items-center gap-1 xs:gap-2">
                              {msg.user !== 'System' && msg.userId !== user.username && (
                                <div className="w-6 h-6 xs:w-5 xs:h-5 sm:w-6 sm:h-6 bg-linear-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-xs sm:text-sm border border-gray-700 shrink-0">
                                  {msg.user.charAt(0)}
                                </div>
                              )}
                              <span className={`text-sm sm:text-base font-medium ${
                                msg.userId === user.username ? 'text-emerald-300' : 
                                msg.user === 'System' ? 'text-gray-400' : 
                                'text-purple-300'
                              }`}>
                                {msg.user}
                                {msg.userId === user.username && ' (You)'}
                              </span>
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500 self-end xs:self-auto">
                              {msg.time}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base leading-relaxed wrap-break-word">
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="p-2 sm:p-4 md:p-6 border-t border-gray-800/50 shrink-0 bg-gray-900/30">
                <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3 md:gap-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message as ${user.username}...`}
                    className="cypher-input no-zoom flex-1 text-base sm:text-lg placeholder:text-sm sm:placeholder:text-base"
                    disabled={isSending}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    enterKeyHint="send"
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isSending}
                    className="cypher-btn-primary px-4 sm:px-5 md:px-6 text-base sm:text-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed min-w-20 sm:min-w-24"
                  >
                    {isSending ? (
                      <span className="flex items-center justify-center gap-1 sm:gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Sending</span>
                      </span>
                    ) : (
                      <>
                        <span className="sm:hidden">📤</span>
                        <span className="hidden sm:inline">Send</span>
                      </>
                    )}
                  </button>
                </form>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-wrap">
                    <span className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      {isConnected ? 'Connected' : 'Offline'}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>Updates every 3s</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{messages.length} msgs</span>
                  </div>
                  <span className="text-gray-600 text-xs sm:text-sm">
                    {isInputFocused ? 'Tap Send button' : 'Press Enter to send'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1 space-y-4 sm:space-y-5 md:space-y-6">
            <div className="glass-card p-3 sm:p-4 md:p-6">
              <h3 className="font-semibold text-white mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base">
                Status
              </h3>
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs sm:text-sm">Connection</span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className={`text-xs sm:text-sm ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isConnected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs sm:text-sm">Users Online</span>
                  <span className="text-emerald-400 text-xs sm:text-sm">
                    {onlineUsers.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs sm:text-sm">Messages</span>
                  <span className="text-emerald-400 text-xs sm:text-sm">
                    {messages.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs sm:text-sm">Your Role</span>
                  <span className={`text-xs sm:text-sm ${
                    user.role === 'admin' ? 'text-purple-400' :
                    user.role === 'anonymous' ? 'text-gray-400' :
                    'text-emerald-400'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card p-3 sm:p-4 md:p-6">
              <h3 className="font-semibold text-white mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base">
                👥 Online ({onlineUsers.length})
              </h3>
              <div className="space-y-2 sm:space-y-3 max-h-60 overflow-y-auto touch-scroll no-scrollbar">
                {onlineUsers.map((username) => (
                  <div 
                    key={username} 
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-800/30 rounded-lg sm:rounded-xl transition-colors"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-linear-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl flex items-center justify-center border border-gray-700 shrink-0">
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
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          Online
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-3 sm:p-4 md:p-6 bg-linear-to-br from-gray-900/50 to-black/50">
              <h3 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">
                How It Works
              </h3>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <p className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Messages sync in real-time</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>No registration needed</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Individual auto-wipe after 10min offline</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Uses temporary server memory</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 p-3 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {onlineUsers.length} online • {messages.length} msgs
            </span>
          </div>
          <div className="text-xs text-gray-500 whitespace-nowrap">
            {user.username}
          </div>
          <div className="text-xs text-gray-600">
            {isInputFocused ? '↩️ Send' : '👇 Tap to type'}
          </div>
        </div>
      </div>

      <div className={`lg:hidden transition-all duration-300 ${
        isInputFocused ? 'h-24' : 'h-16'
      }`}></div>
    </div>
  );
}