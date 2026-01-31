// src/components/ChatWindow.tsx
"use client";

import { useEffect, useRef } from 'react';

interface Message {
  id: number;
  text: string;
  user: string;
  time: string;
  encrypted?: boolean;
}

interface ChatWindowProps {
  messages: Message[];
  currentUser: string;
}

export default function ChatWindow({ messages, currentUser }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="h-[calc(100%-80px)] overflow-y-auto mb-4 p-4 border border-green-500/20 rounded-lg bg-black/30 backdrop-blur-sm"
    >
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-green-300/50">
            <div className="text-4xl mb-4">[SYSTEM_READY]</div>
            <p className="text-sm">NO ENCRYPTED MESSAGES FOUND</p>
            <p className="text-xs mt-2">BEGIN TRANSMISSION...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg border ${
                msg.user === currentUser
                  ? 'bg-green-900/10 border-green-500/30 ml-8'
                  : 'bg-black/50 border-green-500/20 mr-8'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-bold ${
                  msg.user === currentUser ? 'text-green-300' : 'text-cyan-300'
                }`}>
                  {msg.user.toUpperCase()}
                </span>
                <div className="flex items-center gap-2">
                  {msg.encrypted && (
                    <span className="text-green-400/50 text-xs">[ENC]</span>
                  )}
                  <span className="text-green-300/50 text-xs">{msg.time}</span>
                </div>
              </div>
              <p className="text-green-200 whitespace-pre-wrap mt-1">
                {msg.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}