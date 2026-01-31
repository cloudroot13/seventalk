// src/components/SystemStatus.tsx
"use client";

import { useEffect, useState } from 'react';

export default function SystemStatus() {
  const [cpu, setCpu] = useState(0);
  const [memory, setMemory] = useState(0);
  const [encryption, setEncryption] = useState('AES-256');
  const [connection, setConnection] = useState('SECURE');

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(Math.floor(Math.random() * 30) + 10);
      setMemory(Math.floor(Math.random() * 40) + 30);
      setEncryption(['AES-256', 'RSA-2048', 'ECC-521', 'Twofish'][Math.floor(Math.random() * 4)]);
      setConnection(['SECURE', 'ENCRYPTED', 'PROTECTED'][Math.floor(Math.random() * 3)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="terminal-window p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-black/50 rounded border border-green-500/20">
          <div className="text-green-300 text-sm">CPU LOAD</div>
          <div className="text-green-400 text-2xl font-bold">{cpu}%</div>
          <div className="h-2 mt-2 bg-black rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-green-500 to-green-300"
              style={{ width: `${cpu}%` }}
            ></div>
          </div>
        </div>
        
        <div className="text-center p-3 bg-black/50 rounded border border-green-500/20">
          <div className="text-green-300 text-sm">MEMORY</div>
          <div className="text-green-400 text-2xl font-bold">{memory}%</div>
          <div className="h-2 mt-2 bg-black rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-green-500 to-cyan-400"
              style={{ width: `${memory}%` }}
            ></div>
          </div>
        </div>
        
        <div className="text-center p-3 bg-black/50 rounded border border-green-500/20">
          <div className="text-green-300 text-sm">ENCRYPTION</div>
          <div className="text-green-400 text-xl font-bold">{encryption}</div>
          <div className="mt-2">
            <div className="w-3 h-3 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full inline-block mr-1 animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-green-500 rounded-full inline-block animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
        
        <div className="text-center p-3 bg-black/50 rounded border border-green-500/20">
          <div className="text-green-300 text-sm">CONNECTION</div>
          <div className="text-green-400 text-xl font-bold">{connection}</div>
          <div className="mt-2 text-xs text-green-300">
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              LATENCY: {Math.floor(Math.random() * 30) + 10}ms
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center text-green-300/60 text-sm">
        SYSTEM STATUS: OPERATIONAL | THREAT LEVEL: LOW
      </div>
    </div>
  );
}