"use client";

import { useEffect, useRef } from 'react';

export default function BinaryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskImageRef = useRef<HTMLImageElement | null>(null);

  // Pré-carregar a imagem da máscara Anonymous
  useEffect(() => {
    maskImageRef.current = new Image();
    // Usando um SVG da máscara Anonymous (transparente)
    maskImageRef.current.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cpath fill='%2300ffff' d='M100,20c44.2,0,80,35.8,80,80s-35.8,80-80,80S20,144.2,20,100S55.8,20,100,20 M100,10C55.4,10,20,45.4,20,90 s35.4,80,80,80s80-35.4,80-80S144.6,10,100,10L100,10z'/%3E%3Cpath fill='%2300ffff' d='M70,60c0-5.5,4.5-10,10-10h40c5.5,0,10,4.5,10,10v30c0,5.5-4.5,10-10,10H80c-5.5,0-10-4.5-10-10V60z'/%3E%3Cpath fill='%2300ffff' d='M140,85c0-5.5,4.5-10,10-10h10c5.5,0,10,4.5,10,10s-4.5,10-10,10h-10C144.5,95,140,90.5,140,85z'/%3E%3Cpath fill='%2300ffff' d='M40,85c0-5.5,4.5-10,10-10h10c5.5,0,10,4.5,10,10s-4.5,10-10,10H50C44.5,95,40,90.5,40,85z'/%3E%3C/svg%3E";
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const binaryChars = "01";
    const fontSize = 22; // Aumentado de 18 para 22
    let animationId: number;
    let maskOpacity = 0.03; // Opacidade da máscara Anonymous

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const columns = Math.floor(canvas.width / fontSize);
      const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -canvas.height);
      
      const draw = () => {
        // Fundo escuro para contraste
        ctx.fillStyle = 'rgba(3, 3, 10, 0.7)'; // Mais escuro para binários aparecerem mais
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar máscara Anonymous (muito sutil)
        if (maskImageRef.current?.complete) {
          const maskSize = Math.min(canvas.width, canvas.height) * 0.6;
          const maskX = (canvas.width - maskSize) / 2;
          const maskY = (canvas.height - maskSize) / 2;
          
          ctx.globalAlpha = maskOpacity;
          ctx.drawImage(maskImageRef.current, maskX, maskY, maskSize, maskSize);
          ctx.globalAlpha = 1;
        }
        
        // Binários PRINCIPAIS (mais fortes)
        ctx.fillStyle = 'rgba(0, 255, 255, 0.15)'; // Ciano mais forte
        ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        
        for (let i = 0; i < drops.length; i++) {
          const char = binaryChars[Math.floor(Math.random() * binaryChars.length)];
          const x = i * fontSize + fontSize / 2;
          const y = drops[i];
          
          // Efeito de brilho para alguns caracteres
          if (Math.random() > 0.7) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; // Branco brilhante
            ctx.fillText(char, x, y);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.15)'; // Volta ao ciano
          } else {
            ctx.fillText(char, x, y);
          }
          
          if (y > canvas.height && Math.random() > 0.95) {
            drops[i] = 0;
          }
          drops[i] += fontSize * 0.9; // Aumentada velocidade
        }
        
        // Binários SECUNDÁRIOS (ainda mais fortes, em camadas)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.12)'; // Verde esmeralda
        ctx.font = `bold ${fontSize * 0.8}px 'Courier New', monospace`;
        
        const secondaryColumns = Math.floor(canvas.width / (fontSize * 0.8));
        const secondaryOffset = canvas.height * 0.3;
        
        for (let i = 0; i < secondaryColumns; i++) {
          const char = binaryChars[Math.floor(Math.random() * binaryChars.length)];
          const x = i * (fontSize * 0.8) + (fontSize * 0.8) / 2;
          const y = (drops[i % drops.length] + secondaryOffset) % canvas.height;
          
          ctx.fillText(char, x, y);
        }
        
        // Efeito de scanner (linha que varre a tela)
        const scannerY = (Date.now() / 20) % canvas.height;
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scannerY);
        ctx.lineTo(canvas.width, scannerY);
        ctx.stroke();
        
        // Gradiente no scanner
        const scannerGradient = ctx.createLinearGradient(0, scannerY - 10, 0, scannerY + 10);
        scannerGradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
        scannerGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.1)');
        scannerGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = scannerGradient;
        ctx.fillRect(0, scannerY - 10, canvas.width, 20);
        
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
      
      {/* Overlay de gradiente para profundidade */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(5,5,15,0.3)_0%,rgba(0,0,0,0.8)_70%)]"></div>
      
      {/* Efeito de partículas binárias (CSS adicional) */}
      <div className="absolute top-0 left-0 w-full h-full">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-[10px] text-cyan-500/20 font-mono animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </div>
        ))}
      </div>
      
      {/* Efeito de glitch muito sutil */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-500 animate-pulse"></div>
      </div>
    </div>
  );
}