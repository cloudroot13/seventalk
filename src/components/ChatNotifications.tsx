"use client";

import { useState, useEffect, useRef } from 'react';

interface Notification {
  id: number;
  type: 'message' | 'user_join' | 'user_leave' | 'system' | 'connection';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  user?: string;
}

interface ChatNotificationsProps {
  currentUser: string;
  onlineUsers: string[];
  newMessages: Array<{ id: number; user: string; text: string }>;
}

export default function ChatNotifications({ 
  currentUser, 
  onlineUsers, 
  newMessages 
}: ChatNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'system',
      title: 'Welcome to Cypher Chat',
      message: 'Your messages are encrypted and will auto-delete when you leave.',
      timestamp: Date.now(),
      read: true
    }
  ]);
  
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousOnlineUsersRef = useRef<string[]>([]);
  const previousMessagesRef = useRef<number[]>([]);

  // Detecta novos usuários online
  useEffect(() => {
    const previous = previousOnlineUsersRef.current;
    const current = onlineUsers;

    // Usuários que entraram
    const joinedUsers = current.filter(user => 
      !previous.includes(user) && user !== currentUser
    );

    // Usuários que saíram
    const leftUsers = previous.filter(user => 
      !current.includes(user) && user !== currentUser
    );

    // Adicionar notificações para usuários que entraram
    joinedUsers.forEach(user => {
      addNotification({
        type: 'user_join',
        title: 'User Joined',
        message: `${user} has joined the chat`,
        user
      });
    });

    // Adicionar notificações para usuários que saíram
    leftUsers.forEach(user => {
      addNotification({
        type: 'user_leave',
        title: 'User Left',
        message: `${user} has left the chat`,
        user
      });
    });

    previousOnlineUsersRef.current = [...current];
  }, [onlineUsers, currentUser]);

  // Detecta novas mensagens
  useEffect(() => {
    const previousIds = previousMessagesRef.current;
    const currentIds = newMessages.map(msg => msg.id);
    
    // Encontrar novas mensagens
    const newMessageIds = currentIds.filter(id => !previousIds.includes(id));
    const newMessagesList = newMessages.filter(msg => 
      newMessageIds.includes(msg.id) && msg.user !== currentUser && msg.user !== 'System'
    );

    // Adicionar notificações para novas mensagens
    newMessagesList.forEach(msg => {
      addNotification({
        type: 'message',
        title: 'New Message',
        message: `${msg.user}: ${msg.text.length > 30 ? msg.text.substring(0, 30) + '...' : msg.text}`,
        user: msg.user
      });
    });

    previousMessagesRef.current = [...currentIds];
  }, [newMessages, currentUser]);

  // Atualiza contagem de não lidas
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Função para adicionar notificação
  const addNotification = (data: {
    type: Notification['type'];
    title: string;
    message: string;
    user?: string;
  }) => {
    const newNotification: Notification = {
      id: Date.now(),
      type: data.type,
      title: data.title,
      message: data.message,
      timestamp: Date.now(),
      read: false,
      user: data.user
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Mantém apenas últimas 10

    // Mostrar notificação toast se não estiver aberto
    if (!isOpen) {
      showToastNotification(newNotification);
    }
  };

  // Mostrar notificação toast
  const showToastNotification = (notification: Notification) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 min-w-[300px] max-w-sm rounded-lg border p-4 shadow-lg transform transition-all duration-300 animate-slide-in-right ${
      notification.type === 'message' ? 'bg-emerald-900/90 border-emerald-700/50' :
      notification.type === 'user_join' ? 'bg-blue-900/90 border-blue-700/50' :
      notification.type === 'user_leave' ? 'bg-amber-900/90 border-amber-700/50' :
      'bg-gray-900/90 border-gray-700/50'
    }`;
    
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="mt-0.5">
          ${getNotificationIcon(notification.type, 'w-5 h-5')}
        </div>
        <div class="flex-1">
          <div class="font-medium text-white text-sm">${notification.title}</div>
          <div class="text-gray-300 text-xs mt-1">${notification.message}</div>
          <div class="text-gray-500 text-xs mt-2">${formatTime(notification.timestamp)}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (toast.parentElement) {
            document.body.removeChild(toast);
          }
        }, 300);
      }
    }, 5000);
  };

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Marcar uma como lida
  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Remover uma notificação
  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Remover todas as notificações
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Obter ícone baseado no tipo (usando emojis)
  const getNotificationIcon = (type: Notification['type'], className = "w-5 h-5") => {
    const emojis = {
      'message': '💬',
      'user_join': '👤➕',
      'user_leave': '👤➖',
      'connection': '✅',
      'system': 'ℹ️'
    };
    
    const colorClasses = {
      'message': 'text-emerald-400',
      'user_join': 'text-blue-400',
      'user_leave': 'text-amber-400',
      'connection': 'text-green-400',
      'system': 'text-gray-400'
    };
    
    return `
      <div class="${className} ${colorClasses[type]} flex items-center justify-center text-lg">
        ${emojis[type]}
      </div>
    `;
  };

  // Formatar tempo
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  // Obter cor baseada no tipo
  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'message': return 'bg-emerald-900/20 border-emerald-700/30';
      case 'user_join': return 'bg-blue-900/20 border-blue-700/30';
      case 'user_leave': return 'bg-amber-900/20 border-amber-700/30';
      case 'connection': return 'bg-green-900/20 border-green-700/30';
      case 'system': return 'bg-gray-900/20 border-gray-700/30';
      default: return 'bg-gray-900/20 border-gray-700/30';
    }
  };

  // Obter emoji baseado no tipo (para renderização JSX)
  const getNotificationEmoji = (type: Notification['type']) => {
    switch (type) {
      case 'message': return '💬';
      case 'user_join': return '👤➕';
      case 'user_leave': return '👤➖';
      case 'connection': return '✅';
      case 'system': return 'ℹ️';
      default: return '🔔';
    }
  };

  return (
    <>
      {/* Botão de notificações (floating) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 bg-linear-to-br from-gray-900 to-black rounded-full flex items-center justify-center border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Notifications"
      >
        <div className="relative">
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Painel de notificações */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Painel */}
          <div className="fixed top-4 right-4 z-40 w-80 sm:w-96 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg text-emerald-400">🔔</span>
                  <h3 className="font-bold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-gray-400 hover:text-white px-2 py-1 hover:bg-gray-800/50 rounded"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <span className="text-lg">✕</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de notificações */}
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="text-3xl text-gray-600 mb-3 inline-block">🔕</span>
                  <p className="text-gray-400 text-sm">No notifications yet</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Notifications will appear here for new messages and user activity
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800/50">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-800/30 transition-colors ${!notification.read ? 'bg-gray-800/20' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                          <span className="text-lg">{getNotificationEmoji(notification.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium text-white text-sm">
                                {notification.title}
                                {notification.user && notification.user !== currentUser && (
                                  <span className="text-gray-400 text-xs ml-2">
                                    @{notification.user}
                                  </span>
                                )}
                              </h4>
                              <p className="text-gray-300 text-xs mt-1">
                                {notification.message}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="text-gray-500 hover:text-white shrink-0 ml-2"
                            >
                              <span className="text-lg">✕</span>
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-gray-500 text-xs">
                              {formatTime(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">
                    {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-gray-400 hover:text-red-400 px-3 py-1 hover:bg-gray-800/50 rounded"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Estilos para animações */}
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}