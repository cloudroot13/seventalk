"use client";

import { useEffect, useCallback, useRef } from 'react';

interface UserActivityTrackerProps {
  username: string;
  isOnline: boolean;
  apiUrl: string;
  onUserMessagesCleared?: (username: string) => void;
}

export default function UserActivityTracker({ 
  username, 
  isOnline, 
  apiUrl,
  onUserMessagesCleared 
}: UserActivityTrackerProps) {
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const reportActivity = useCallback(async () => {
    if (!username) return;
    
    try {
      await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          action: 'user_activity',
          data: { username }
        })
      });
      
      lastActivityRef.current = Date.now();
      console.log(`👤 Atividade reportada para ${username}`);
    } catch (error) {
      console.error('Error reporting activity:', error);
    }
  }, [username, apiUrl]);

  useEffect(() => {
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current > 30000) {
        reportActivity();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [reportActivity]);

  useEffect(() => {
    if (!isOnline || !username) return;

    reportActivity();

    activityIntervalRef.current = setInterval(() => {
      reportActivity();
    }, 60 * 1000);

    return () => {
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
        activityIntervalRef.current = null;
      }
    };
  }, [isOnline, username, reportActivity]);

  useEffect(() => {
    if (!isOnline && username) {
      console.log(`📴 ${username} está offline. Timer de 10min iniciado.`);
      
      if (onUserMessagesCleared) {
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
        
        inactivityTimerRef.current = setTimeout(() => {
          onUserMessagesCleared(username);
        }, 10 * 60 * 1000);
      }
    } else {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    }
    
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [isOnline, username, onUserMessagesCleared]);

  return null;
}