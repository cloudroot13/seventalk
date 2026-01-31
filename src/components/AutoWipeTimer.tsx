// src/components/AutoWipeTimer.tsx
"use client";

import { useState, useEffect } from 'react';

interface AutoWipeTimerProps {
  onWipe: () => void;
  wipeTimeMinutes?: number;
}

export default function AutoWipeTimer({ onWipe, wipeTimeMinutes = 5 }: AutoWipeTimerProps) {
  const [timeLeft, setTimeLeft] = useState(wipeTimeMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onWipe();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 60) {
          setIsWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onWipe]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={`p-2 rounded border ${isWarning ? 'border-red-500/50 bg-red-900/20' : 'border-green-500/30 bg-black/50'}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs text-green-300/60 font-mono">
          AUTO-WIPE IN:
        </div>
        <div className={`text-sm font-bold font-mono ${isWarning ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>
      {isWarning && (
        <div className="text-red-400/70 text-xs mt-1 font-mono">
          WARNING: Messages will be wiped soon
        </div>
      )}
    </div>
  );
}