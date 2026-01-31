// src/components/TerminalCommands.tsx
"use client";

import { useState, KeyboardEvent } from 'react';

interface TerminalCommandsProps {
  onCommand: (command: string) => void;
  availableUsers: string[];
}

export default function TerminalCommands({ onCommand, availableUsers }: TerminalCommandsProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const commands = {
    clear: "Limpa a tela do terminal",
    help: "Mostra esta ajuda",
    users: "Lista usuários disponíveis",
    encrypt: "Mostra exemplo de criptografia",
    time: "Mostra hora atual do sistema",
    version: "Versão do sistema",
  };

  const handleCommand = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      const cmd = input.trim().toLowerCase();
      setHistory([...history, `> ${input}`]);
      
      switch(cmd) {
        case '/clear':
          setHistory([]);
          break;
        case '/help':
          setShowHelp(true);
          setTimeout(() => setShowHelp(false), 5000);
          break;
        case '/users':
          setHistory(prev => [...prev, `Usuários ativos: ${availableUsers.join(', ')}`]);
          break;
        case '/encrypt':
          setHistory(prev => [...prev, 'Sistema: [ENC:48][ENC:65][ENC:43]']);
          break;
        case '/time':
          setHistory(prev => [...prev, `Hora: ${new Date().toLocaleTimeString()}`]);
          break;
        case '/version':
          setHistory(prev => [...prev, 'Anonymous Chat v1.0.0 | ENCRYPTED']);
          break;
        default:
          onCommand(input);
          break;
      }
      
      setInput('');
    }
  };

  return (
    <div className="terminal-window p-4 mt-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-green-400 ml-2 text-sm">TERMINAL://SYSTEM</span>
      </div>
      
      <div className="h-40 overflow-y-auto mb-3 p-2 bg-black/50 rounded border border-green-500/20">
        {history.map((line, i) => (
          <div key={i} className="text-green-300 font-mono text-sm mb-1">
            {line}
          </div>
        ))}
        
        {showHelp && (
          <div className="mt-2 p-2 bg-black/70 border border-green-500/30 rounded">
            <div className="text-green-400 font-bold mb-1">COMANDOS DISPONÍVEIS:</div>
            {Object.entries(commands).map(([cmd, desc]) => (
              <div key={cmd} className="text-green-300 text-sm">
                /{cmd} - {desc}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center">
        <span className="text-green-500 mr-2">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          placeholder="Digite um comando ou mensagem..."
          className="flex-1 bg-transparent border-none outline-none text-green-300 font-mono placeholder-green-300/30"
          autoFocus
        />
      </div>
      <div className="text-green-300/40 text-xs mt-2">
        Pressione Enter para enviar. Digite /help para ajuda.
      </div>
    </div>
  );
}