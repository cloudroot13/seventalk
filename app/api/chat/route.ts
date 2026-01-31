// app/api/chat/route.ts
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

export async function GET(request: NextRequest) {
  try {
    // Retornar apenas últimas 50 mensagens
    const recentMessages = messages.slice(-50);
    
    return NextResponse.json({
      success: true,
      messages: recentMessages,
      onlineUsers: Array.from(onlineUsers)
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    console.log('API Request:', { action, data });

    if (action === 'send_message') {
      const newMessage = {
        id: Date.now(),
        text: data.text,
        user: data.user,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userId: data.userId
      };
      
      console.log('Adding message:', newMessage);
      messages.push(newMessage);
      
      // Limitar a 100 mensagens no máximo
      if (messages.length > 100) {
        messages = messages.slice(-50);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: newMessage 
      });
    }

    if (action === 'add_online_user') {
      onlineUsers.add(data.username);
      console.log('User online:', data.username, 'All online:', Array.from(onlineUsers));
      return NextResponse.json({ 
        success: true, 
        onlineUsers: Array.from(onlineUsers) 
      });
    }

    if (action === 'remove_online_user') {
      onlineUsers.delete(data.username);
      console.log('User offline:', data.username, 'Remaining:', Array.from(onlineUsers));
      return NextResponse.json({ 
        success: true, 
        onlineUsers: Array.from(onlineUsers) 
      });
    }

    if (action === 'clear_chat') {
      messages = [];
      console.log('Chat cleared');
      return NextResponse.json({ 
        success: true,
        message: 'Chat cleared successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}