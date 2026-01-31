// src/components/HackerNotifications.tsx
"use client";

import { useState, useEffect } from 'react';

const hackerMessages = [
  "SYSTEM: Encryption layer activated",
  "SECURITY: Firewall reinforced",
  "NETWORK: Connection secured via VPN",
  "DATA: Messages are auto-wiping on exit",
  "ALERT: Intrusion detection active",
  "SYSTEM: All communications encrypted",
  "SECURITY: End-to-end encryption enabled",
  "LOG: Session started anonymously",
];

export default function HackerNotifications() {
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (notifications.length < 5 && Math.random() > 0.7) {
        const randomMsg = hackerMessages[Math.floor(Math.random() * hackerMessages.length)];
        setNotifications(prev => [...prev, randomMsg]);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.slice(1));
        }, 5000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [notifications.length]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((msg, index) => (
        <div
          key={index}
          className="bg-black/90 backdrop-blur-sm border border-green-500/50 rounded p-3 animate-pulse"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
            <div className="flex-1">
              <div className="text-green-300 text-sm font-mono">{msg}</div>
              <div className="text-green-400/50 text-xs mt-1">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}