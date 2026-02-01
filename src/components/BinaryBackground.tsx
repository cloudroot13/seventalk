"use client";

import { useEffect, useRef } from 'react';

export default function BinaryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const binaryChars = "01";
    const fontSize = 24; // Aumentado para maior visibilidade
    let animationId: number;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const columns = Math.floor(canvas.width / fontSize);
      const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -canvas.height);
      
      const draw = () => {
        // Fundo bem escuro para contraste máximo
        ctx.fillStyle = 'rgba(2, 2, 8, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar SÍMBOLO $ GRANDE no centro (verde forte)
        const dollarSize = Math.min(canvas.width, canvas.height) * 0.8; // 80% da tela
        const dollarX = (canvas.width - dollarSize) / 2;
        const dollarY = (canvas.height - dollarSize) / 2;
        
        ctx.globalAlpha = 0.07; // Muito sutil mas visível
        ctx.fillStyle = '#00ff00'; // Verde forte
        ctx.font = `bold ${dollarSize * 0.8}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', canvas.width / 2, canvas.height / 2);
        ctx.globalAlpha = 1;
        
        // BINÁRIOS PRINCIPAIS - MUITO FORTES
        ctx.fillStyle = 'rgba(0, 255, 0, 0.25)'; // Verde forte e visível
        ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        
        for (let i = 0; i < drops.length; i++) {
          const char = binaryChars[Math.floor(Math.random() * binaryChars.length)];
          const x = i * fontSize + fontSize / 2;
          const y = drops[i];
          
          // Efeito de brilho alternado (50% dos caracteres mais brilhantes)
          if (Math.random() > 0.5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // Branco muito brilhante
            ctx.fillText(char, x, y);
            ctx.fillStyle = 'rgba(0, 255, 0, 0.25)'; // Volta ao verde
          } else {
            ctx.fillText(char, x, y);
          }
          
          if (y > canvas.height && Math.random() > 0.97) {
            drops[i] = 0;
          }
          drops[i] += fontSize * 0.95; // Velocidade alta
        }
        
        // BINÁRIOS SECUNDÁRIOS (mais rápidos, mais brilhantes)
        ctx.fillStyle = 'rgba(0, 255, 100, 0.2)'; // Verde limão
        ctx.font = `bold ${fontSize * 0.9}px 'Courier New', monospace`;
        
        const secondaryColumns = Math.floor(canvas.width / (fontSize * 0.9));
        const secondaryOffset = canvas.height * 0.4;
        
        for (let i = 0; i < secondaryColumns; i++) {
          const char = binaryChars[Math.floor(Math.random() * binaryChars.length)];
          const x = i * (fontSize * 0.9) + (fontSize * 0.9) / 2;
          const y = (drops[i % drops.length] + secondaryOffset) % canvas.height;
          
          // 30% chance de binário super brilhante
          if (Math.random() > 0.7) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText(char, x, y);
            ctx.restore();
          } else {
            ctx.fillText(char, x, y);
          }
        }
        
        // BINÁRIOS TERCIÁRIOS (pequenos e rápidos)
        ctx.fillStyle = 'rgba(100, 255, 100, 0.15)';
        ctx.font = `bold ${fontSize * 0.7}px 'Courier New', monospace`;
        
        const tertiaryColumns = Math.floor(canvas.width / (fontSize * 0.7));
        
        for (let i = 0; i < tertiaryColumns; i++) {
          const char = binaryChars[Math.floor(Math.random() * binaryChars.length)];
          const x = i * (fontSize * 0.7) + (fontSize * 0.7) / 2;
          const y = (drops[(i * 3) % drops.length] * 1.3) % canvas.height;
          
          ctx.fillText(char, x, y);
        }
        
        // EFEITO SCANNER (linha verde que varre)
        const scannerY = (Date.now() / 15) % canvas.height;
        
        // Gradiente do scanner
        const scannerGradient = ctx.createLinearGradient(0, scannerY - 15, 0, scannerY + 15);
        scannerGradient.addColorStop(0, 'rgba(0, 255, 0, 0)');
        scannerGradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.15)');
        scannerGradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        
        ctx.fillStyle = scannerGradient;
        ctx.fillRect(0, scannerY - 15, canvas.width, 30);
        
        // Linha central do scanner
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, scannerY);
        ctx.lineTo(canvas.width, scannerY);
        ctx.stroke();
        
        animationId = requestAnimationFrame(draw);
      };
      
      draw();
    };

    init();
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        aria-hidden="true"
      />
      
      {/* Overlay de gradiente verde escuro */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(0,20,0,0.4)_0%,rgba(0,0,0,0.9)_80%)]"></div>
      
      {/* Partículas binárias extras (CSS) */}
      <div className="absolute top-0 left-0 w-full h-full">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-xs text-green-500/30 font-mono font-bold animate-float-fast"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${8 + Math.random() * 5}s`
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </div>
        ))}
      </div>
      
      {/* Efeito de brilho pulsante no símbolo $ */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="text-green-500/5 text-[40vw] font-bold font-mono animate-pulse-slow">$</div>
      </div>
    </div>
  );
}