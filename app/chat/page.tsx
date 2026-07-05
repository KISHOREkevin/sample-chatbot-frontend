"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_CHATS, MOCK_AI_RESPONSES, MOCK_DEFAULT_RESPONSE, ChatSession, Message } from '../sampleData';
import { Sidebar } from '../../components/Sidebar';
import { ChatPane } from '../../components/ChatPane';
import { SubscriptionModal } from '../../components/SubscriptionModal';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { logoutUser } from '@/redux/slices/authSlice';

export default function ChatPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, planId, isInitialized } = useAppSelector((state) => state.auth);

  // Chat-related state (Hooks must be declared unconditionally at the top)
  const [chats, setChats] = useState<ChatSession[]>(MOCK_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>('chat-1');
  const [isResponding, setIsResponding] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'deepseek-v3' | 'deepseek-r1' | 'claude-3-5-sonnet' | 'gpt-4o'>('deepseek-v3');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Render a loading state during hydration/initialization to prevent hydration mismatches
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#080B11] text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-medium tracking-wide">Syncing workspace...</p>
        </div>
      </div>
    );
  }

  // Map Redux user details to layout display
  const currentUser = {
    name: user?.full_name || 'Anonymous User',
    email: user?.email || 'no-email@chat.com',
    provider: 'email-password' as const,
    avatar_url: user?.avatar_url,
    planId: planId
  };

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
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    dispatch(logoutUser());
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
        user={currentUser}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        chats={chats}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleNewChat={handleNewChat}
        handleLogout={handleLogout}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
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
        userPlanId={planId}
        onTriggerSubscription={() => setIsSubscriptionModalOpen(true)}
      />

      {/* SUBSCRIPTION CONSOLE MODAL */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      {/* LOGOUT CONFIRMATION MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsLogoutModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl animate-scaleIn">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">Sign Out</h3>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Are you sure you want to end your active secure session? You will need to re-verify your identity to sign back in.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 rounded-xl border border-white/10 bg-slate-900/50 py-2.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-slate-900 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-500/20 transition-all hover:from-rose-600 hover:to-rose-700 hover:shadow-rose-600/30 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
