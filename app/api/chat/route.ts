import { NextRequest, NextResponse } from 'next/server';

// Armazenamento VOLÁTIL em memória (não é banco de dados!)
let messages: Array<{
  id: number;
  text: string;
  user: string;
  time: string;
  userId: string;
}> = [];

let onlineUsers: Set<string> = new Set();

// Função auxiliar para responses com CORS
function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 horas de cache para preflight
    },
  });
}

// Handler para OPTIONS (preflight requests)
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
    // Debug: Log de quem está solicitando
    const origin = request.headers.get('origin') || 'Unknown';
    console.log(`📥 GET request from origin: ${origin}`);
    
    // Retornar apenas últimas 50 mensagens
    const recentMessages = messages.slice(-50);
    
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
      const newMessage = {
        id: Date.now(),
        text: data.text,
        user: data.user,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userId: data.userId
      };
      
      console.log('💬 Adding message from:', data.user);
      messages.push(newMessage);
      
      // Limitar a 100 mensagens no máximo
      if (messages.length > 100) {
        messages = messages.slice(-50);
      }
      
      return jsonResponse({ 
        success: true, 
        message: newMessage,
        totalMessages: messages.length
      });
    }

    if (action === 'add_online_user') {
      onlineUsers.add(data.username);
      console.log('✅ User online:', data.username, 'All online:', Array.from(onlineUsers));
      return jsonResponse({ 
        success: true, 
        onlineUsers: Array.from(onlineUsers),
        addedUser: data.username
      });
    }

    if (action === 'remove_online_user') {
      onlineUsers.delete(data.username);
      console.log('❌ User offline:', data.username, 'Remaining:', Array.from(onlineUsers));
      return jsonResponse({ 
        success: true, 
        onlineUsers: Array.from(onlineUsers),
        removedUser: data.username
      });
    }

    if (action === 'clear_chat') {
      const previousCount = messages.length;
      messages = [];
      console.log('🧹 Chat cleared. Previous messages:', previousCount);
      return jsonResponse({ 
        success: true,
        message: 'Chat cleared successfully',
        clearedMessages: previousCount
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