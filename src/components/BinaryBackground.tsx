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
    const fontSize = 18;
    let animationId: number;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const columns = Math.floor(canvas.width / fontSize);
      const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -canvas.height);
      
      const draw = () => {
        // Fundo quase transparente
        ctx.fillStyle = 'rgba(5, 5, 5, 0.03)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Texto VISÍVEL
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        
        for (let i = 0; i < drops.length; i++) {
          const char = binaryChars[Math.floor(Math.random() * binaryChars.length)];
          const x = i * fontSize + fontSize / 2;
          const y = drops[i];
          
          ctx.fillText(char, x, y);
          
          if (y > canvas.height && Math.random() > 0.95) {
            drops[i] = 0;
          }
          drops[i] += fontSize * 0.8;
        }
        
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
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none opacity-90"
      aria-hidden="true"
    />
  );
}