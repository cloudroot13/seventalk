// src/components/MessageInput.tsx
"use client";

import { useState } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="TYPE ENCRYPTED MESSAGE HERE..."
        className="flex-1 bg-black/50 border border-green-500/50 rounded-lg px-4 py-3 text-green-300 font-mono focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder-green-300/30"
      />
      <button
        type="submit"
        className="px-6 bg-linear-to-r from-green-800/50 to-black border border-green-500 text-green-300 font-mono rounded-lg hover:border-green-400 hover:text-green-200 transition-all duration-300 active:scale-95"
      >
        [SEND]
      </button>
    </form>
  );
}