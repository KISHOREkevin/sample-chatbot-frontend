"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_CHATS, MOCK_AI_RESPONSES, MOCK_DEFAULT_RESPONSE, ChatSession, Message } from '../sampleData';
import { Sidebar } from '../../components/Sidebar';
import { ChatPane } from '../../components/ChatPane';

export default function ChatPage() {
  const router = useRouter();

  // Mocked user profile strictly for layout display
  const mockUser = {
    name: 'Alex Carter',
    email: 'alex.carter@enterprise.com',
    provider: 'email-password' as const
  };

  // Chat-related state
  const [chats, setChats] = useState<ChatSession[]>(MOCK_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>('chat-1');
  const [isResponding, setIsResponding] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-2-flash' | 'gemini-2-pro' | 'gemini-1-ultra'>('gemini-2-flash');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle Sending a Message (Simulated streaming responses)
  const handleSendMessage = (text: string) => {
    if (!text.trim() || isResponding) return;

    // Create User Message
    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update messages lists
    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: [...chat.messages, userMsg]
          };
        }
        return chat;
      })
    );

    // Trigger simulated AI responder
    setIsResponding(true);
    
    setTimeout(() => {
      // Find matching keywords response
      const matched = MOCK_AI_RESPONSES.find(resp => 
        resp.keywords.some(keyword => text.toLowerCase().includes(keyword))
      );
      
      let responseText = matched ? matched.text : MOCK_DEFAULT_RESPONSE;

      // Inject custom prompt dynamically if user requested an image
      if (text.toLowerCase().includes('image') || text.startsWith('/image')) {
        const promptValue = text.replace(/^\/image\s*/i, '').trim() || 'A futuristic glassmorphic workspace layout with glowing networks';
        responseText = `Here is your generated image based on the prompt: **"${promptValue}"**
        
![Futuristic Workspace](/futuristic_workspace.png)

This layout features neon blue and purple glowing grid systems, representing clean enterprise pathways. Feel free to refine the prompt for a new render!`;
      }
      
      // Simulate streaming AI Response bubble
      const assistantMsg: Message = {
        id: `msg-assistant-${Date.now()}`,
        sender: 'assistant',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats(prevChats => 
        prevChats.map(chat => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: [...chat.messages, assistantMsg]
            };
          }
          return chat;
        })
      );
      
      setIsResponding(false);

      // Render streaming characters
      let currentLength = 0;
      const interval = setInterval(() => {
        currentLength += 8;
        if (currentLength >= responseText.length) {
          clearInterval(interval);
          setChats(prevChats => 
            prevChats.map(chat => {
              if (chat.id === activeChatId) {
                const nextMessages = [...chat.messages];
                const lastIdx = nextMessages.length - 1;
                if (nextMessages[lastIdx] && nextMessages[lastIdx].sender === 'assistant') {
                  nextMessages[lastIdx] = {
                    ...nextMessages[lastIdx],
                    text: responseText
                  };
                }
                return { ...chat, messages: nextMessages };
              }
              return chat;
            })
          );
        } else {
          setChats(prevChats => 
            prevChats.map(chat => {
              if (chat.id === activeChatId) {
                const nextMessages = [...chat.messages];
                const lastIdx = nextMessages.length - 1;
                if (nextMessages[lastIdx] && nextMessages[lastIdx].sender === 'assistant') {
                  nextMessages[lastIdx] = {
                    ...nextMessages[lastIdx],
                    text: responseText.slice(0, currentLength) + ' ▌'
                  };
                }
                return { ...chat, messages: nextMessages };
              }
              return chat;
            })
          );
        }
      }, 30);

    }, 1200);
  };

  // Start a new chat session
  const handleNewChat = () => {
    const newId = `chat-new-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: '✨ New AI Conversation',
      category: 'Recent',
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          sender: 'assistant',
          text: `Welcome! I'm your AI Assistant, configured using secure Email/Google authentication. Ask me anything about engineering, design systems, or data structures.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    setChats([newSession, ...chats]);
    setActiveChatId(newId);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  return (
    <div className="flex h-screen w-full bg-[#080B11] text-zinc-100 overflow-hidden font-sans">
      
      {/* Glow Ambient Circles */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-80 w-[600px] h-[600px] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none"></div>

      {/* MOBILE DRAWER BACKDROP */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* SIDEBAR PANEL */}
      <Sidebar
        user={mockUser}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        chats={chats}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleNewChat={handleNewChat}
        handleLogout={handleLogout}
      />

      {/* MAIN SCREEN CHAT SPACE */}
      <ChatPane
        activeChat={activeChat}
        isResponding={isResponding}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
}
