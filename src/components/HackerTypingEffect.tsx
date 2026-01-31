// src/components/HackerTypingEffect.tsx
"use client";

import { useState, useEffect } from 'react';

export default function HackerTypingEffect() {
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const hackerTexts = [
    "Initializing secure connection...",
    "Encrypting transmission...",
    "Establishing anonymous tunnel...",
    "Verifying credentials...",
    "Loading encryption protocols...",
  ];

  useEffect(() => {
    const typeText = async () => {
      const randomText = hackerTexts[Math.floor(Math.random() * hackerTexts.length)];
      
      setIsTyping(true);
      setTypedText('');
      
      for (let i = 0; i < randomText.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
        setTypedText(randomText.substring(0, i + 1));
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsTyping(false);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      typeText(); // Loop
    };

    typeText();
    
    return () => {
      setIsTyping(false);
    };
  }, []);

  if (!isTyping && typedText === '') return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-black/80 backdrop-blur-sm border border-green-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-1 h-3 bg-green-500 animate-pulse"></div>
            <div className="w-1 h-3 bg-green-500 animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-1 h-3 bg-green-500 animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
          <div className="text-green-300 text-sm font-mono">
            {typedText}
            <span className="inline-block w-2 h-4 ml-1 bg-green-500 animate-pulse"></span>
          </div>
        </div>
      </div>
    </div>
  );
}