import { NextRequest, NextResponse } from 'next/server';

interface Message {
  id: number;
  text: string;
  user: string;
  time: string;
  userId: string;
  userLastActive: number;
  messageTimestamp: number;
}

let messages: Message[] = [];
let onlineUsers: Set<string> = new Set();
let userActivityTimers: Map<string, NodeJS.Timeout> = new Map();

function clearUserMessages(username: string) {
  const beforeCount = messages.length;
  messages = messages.filter(msg => msg.user !== username);
  const afterCount = messages.length;
  const cleared = beforeCount - afterCount;
  
  if (cleared > 0) {
    console.log(`🧹 Limpando ${cleared} mensagens do usuário ${username} (inativo > 10min)`);
  }
  
  userActivityTimers.delete(username);
}

function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const origin = request.headers.get('origin') || 'Unknown';
    console.log(`📥 GET request from origin: ${origin}`);
    
    const recentMessages = messages.slice(-50).map(msg => ({
      id: msg.id,
      text: msg.text,
      user: msg.user,
      time: msg.time,
      userId: msg.userId
    }));
    
    console.log(`📊 Returning ${recentMessages.length} messages to ${origin}`);
    
    return jsonResponse({
      success: true,
      messages: recentMessages,
      onlineUsers: Array.from(onlineUsers),
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ GET Error:', error);
    return jsonResponse(
      { success: false, error: 'Failed to fetch messages' },
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin') || 'Unknown';
    console.log(`📨 POST request from origin: ${origin}`);
    
    const body = await request.json();
    const { action, data } = body;

    console.log('🔄 API Action:', { action, data, origin });

    if (action === 'send_message') {
      const now = Date.now();
      const newMessage: Message = {
        id: now,
        text: data.text,
        user: data.user,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userId: data.userId,
        userLastActive: now,
        messageTimestamp: now
      };
      
      console.log('💬 Adding message from:', data.user);
      messages.push(newMessage);
      
      updateUserActivityTimer(data.user);
      
      if (messages.length > 100) {
        messages = messages.slice(-50);
      }
      
      return jsonResponse({ 
        success: true, 
        message: {
          id: newMessage.id,
          text: newMessage.text,
          user: newMessage.user,
          time: newMessage.time,
          userId: newMessage.userId
        },
        totalMessages: messages.length
      });
    }

    if (action === 'add_online_user') {
      onlineUsers.add(data.username);
      console.log('✅ User online:', data.username, 'All online:', Array.from(onlineUsers));
      
      updateUserActivityTimer(data.username);
      
      return jsonResponse({ 
        success: true, 
        onlineUsers: Array.from(onlineUsers),
        addedUser: data.username
      });
    }

    if (action === 'remove_online_user') {
      onlineUsers.delete(data.username);
      console.log('❌ User offline:', data.username, 'Remaining:', Array.from(onlineUsers));
      
      startInactivityTimer(data.username);
      
      return jsonResponse({ 
        success: true, 
        onlineUsers: Array.from(onlineUsers),
        removedUser: data.username
      });
    }

    if (action === 'clear_chat') {
      const previousCount = messages.length;
      messages = [];
      userActivityTimers.forEach(timer => clearTimeout(timer));
      userActivityTimers.clear();
      
      console.log('🧹 Chat cleared. Previous messages:', previousCount);
      return jsonResponse({ 
        success: true,
        message: 'Chat cleared successfully',
        clearedMessages: previousCount
      });
    }

    if (action === 'user_activity') {
      updateUserActivityTimer(data.username);
      return jsonResponse({ 
        success: true,
        message: 'User activity updated'
      });
    }

    console.log('⚠️ Invalid action received:', action);
    return jsonResponse(
      { success: false, error: 'Invalid action' },
      400
    );
  } catch (error) {
    console.error('❌ POST Error:', error);
    return jsonResponse(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  }
}

function updateUserActivityTimer(username: string) {
  const existingTimer = userActivityTimers.get(username);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }
  
  const now = Date.now();
  messages = messages.map(msg => 
    msg.user === username 
      ? { ...msg, userLastActive: now }
      : msg
  );
  
  const newTimer = setTimeout(() => {
    clearUserMessages(username);
  }, 10 * 60 * 1000);
  
  userActivityTimers.set(username, newTimer);
  console.log(`⏰ Timer resetado para ${username}`);
}

function startInactivityTimer(username: string) {
  const existingTimer = userActivityTimers.get(username);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }
  
  const inactivityTimer = setTimeout(() => {
    clearUserMessages(username);
  }, 10 * 60 * 1000);
  
  userActivityTimers.set(username, inactivityTimer);
  console.log(`⏰ Timer de inatividade iniciado para ${username} (offline)`);
}