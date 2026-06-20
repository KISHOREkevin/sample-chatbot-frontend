"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChatSession } from '../app/sampleData';
import { parseMarkdown } from './MarkdownRenderer';

interface ChatPaneProps {
  activeChat: ChatSession;
  isResponding: boolean;
  selectedModel: 'gemini-2-flash' | 'gemini-2-pro' | 'gemini-1-ultra';
  setSelectedModel: (val: 'gemini-2-flash' | 'gemini-2-pro' | 'gemini-1-ultra') => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  handleSendMessage: (textToSend: string) => void;
}

export const ChatPane: React.FC<ChatPaneProps> = ({
  activeChat,
  isResponding,
  selectedModel,
  setSelectedModel,
  isSidebarOpen,
  setIsSidebarOpen,
  handleSendMessage
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // Local static prompt suggestion chips
  const promptSuggestions = [
    { title: 'Secure SSO Implementation', text: 'How do I build security boundaries around Enterprise SSO routes?' },
    { title: 'Tailwind CSS v4 Setup', text: 'How can we use custom styles in Tailwind CSS v4 inline theme?' },
    { title: 'Google Sign-In Scopes', text: 'What scopes are best for Google Auth user integration?' },
    { title: 'Code: Alert Notification', text: 'Write a glassmorphism notification component in React.' }
  ];

  // Auto-scroll effect local to the chat workspace
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages?.length, isResponding]);

  // Clean submission wrapper
  const handleLocalSubmit = (customText?: string) => {
    const text = customText || inputMessage;
    if (!text.trim()) return;
    
    handleSendMessage(text);
    if (!customText) {
      setInputMessage('');
    }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 relative">
      
      {/* Workspace Top Header */}
      <header className="h-16 border-b border-white/5 bg-slate-950/20 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 lg:hidden text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* AI Model Selector */}
          <div className="flex items-center gap-2.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:inline">Model:</label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                className="bg-slate-900 border border-white/10 hover:border-white/20 text-white rounded-xl text-xs font-semibold py-2 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none"
              >
                <option value="gemini-2-flash">✨ Gemini 2.5 Flash (Default)</option>
                <option value="gemini-2-pro">🧠 Gemini 2.5 Pro (Heavy reasoning)</option>
                <option value="gemini-1-ultra">🔥 Gemini 1.5 Ultra (Legacy)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Live Node Connected
          </div>
        </div>
      </header>

      {/* CHAT MESSAGES DISPLAY */}
      <section className="flex-1 overflow-y-auto px-4 py-8 lg:px-12 space-y-6">
        {activeChat && activeChat.messages.length > 0 ? (
          activeChat.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-4xl mx-auto ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Assistant profile icon */}
              {msg.sender === 'assistant' && (
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px] flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <div className="h-full w-full bg-slate-950 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Chat Bubble */}
              <div
                className={`
                  relative max-w-[85%] rounded-2xl p-4 lg:p-5 text-sm shadow-md transition-all duration-200
                  ${msg.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900/60 border border-white/5 text-zinc-100 rounded-tl-none backdrop-blur-sm'}
                `}
              >
                <div className="chat-markdown font-sans leading-relaxed">
                  {msg.sender === 'assistant' ? parseMarkdown(msg.text) : <p className="whitespace-pre-wrap">{msg.text}</p>}
                </div>
                
                <div className={`text-[10px] mt-2 text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'text-zinc-500'} font-medium`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))
        ) : (
          /* EMPTY STATE HERO */
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto px-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl mb-6">
              <svg className="w-8 h-8 text-indigo-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Aegis Workspace</h2>
            <p className="text-sm text-zinc-400 mb-8">
              Your sandbox environment is initialized. Select one of the enterprise presets below or type a query.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {promptSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLocalSubmit(item.text)}
                  className="p-4 bg-slate-900/50 hover:bg-slate-900 border border-white/5 hover:border-white/10 text-left rounded-xl transition-all duration-200 group cursor-pointer"
                >
                  <h4 className="font-semibold text-xs text-white group-hover:text-indigo-400 transition-colors mb-1">{item.title}</h4>
                  <p className="text-xs text-zinc-500 line-clamp-2">{item.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isResponding && (
          <div className="flex gap-4 max-w-4xl mx-auto justify-start">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px] flex-shrink-0">
              <div className="h-full w-full bg-slate-950 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-none p-4 bg-slate-900/60 border border-white/5 text-zinc-100 shadow-md backdrop-blur-sm">
              <div className="flex items-center gap-1.5 py-1 px-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 pulse-dot"></span>
                <span className="w-2 h-2 rounded-full bg-purple-400 pulse-dot"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 pulse-dot"></span>
                <span className="text-xs text-zinc-500 ml-2 font-medium">Aegis AI is parsing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </section>

      {/* INPUT FORM COMPOSER */}
      <footer className="p-4 lg:p-8 bg-gradient-to-t from-[#080B11] via-[#080B11]/90 to-transparent">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Suggestion Chips visible only when active chat has few messages */}
          {activeChat && activeChat.messages.length <= 2 && (
            <div className="flex gap-2 overflow-x-auto pb-1 select-none scrollbar-none">
              {promptSuggestions.slice(0, 3).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLocalSubmit(item.text)}
                  className="flex-shrink-0 px-3.5 py-1.5 bg-slate-900 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer animate-fadeIn"
                >
                  {item.title}
                </button>
              ))}
            </div>
          )}

          <div className="relative bg-slate-950/70 border border-white/10 rounded-2xl shadow-2xl focus-within:border-indigo-500/50 backdrop-blur-md transition-colors duration-200">
            
            <textarea
              ref={textInputRef}
              rows={1}
              placeholder="Type details about your architecture..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleLocalSubmit();
                }
              }}
              className="w-full pl-4 pr-16 py-4 bg-transparent border-0 text-white placeholder-zinc-500 text-sm focus:outline-none resize-none min-h-[52px] max-h-48"
            />

            <div className="absolute right-3 bottom-2.5 flex items-center gap-2">
              
              {/* AI Image Generation Button */}
              <button 
                type="button" 
                onClick={() => handleLocalSubmit("/image " + inputMessage)}
                disabled={!inputMessage.trim() || isResponding}
                className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                title="Generate AI Image"
              >
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleLocalSubmit()}
                disabled={!inputMessage.trim() || isResponding}
                className={`
                  p-2 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer
                  ${inputMessage.trim() && !isResponding
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95'
                    : 'bg-zinc-800/40 text-zinc-600 pointer-events-none'}
                `}
              >
                <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

          </div>

          <div className="flex justify-between items-center px-2 text-[10px] text-zinc-500">
            <span>Secure Session • AES 256 Handshake</span>
            <span>Gemini models may output mock info</span>
          </div>

        </div>
      </footer>

    </main>
  );
};
