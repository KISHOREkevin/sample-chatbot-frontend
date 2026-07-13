"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChatSession } from '@/types/chat';
import MarkdownRenderer from './MarkdownRenderer';
import { hasPlanFeature } from './SubscriptionModal';

interface ChatPaneProps {
  activeChat: ChatSession;
  isResponding: boolean;
  selectedModel: 'deepseek-v3' | 'deepseek-r1' | 'claude-3-5-sonnet' | 'gpt-4o';
  setSelectedModel: (val: 'deepseek-v3' | 'deepseek-r1' | 'claude-3-5-sonnet' | 'gpt-4o') => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  handleSendMessage: (textToSend: string) => void;
  handleEditMessage: (messageId: string, textToSend: string) => void;
  handleStopGeneration: () => void;
  userPlanId: string;
  onTriggerSubscription: () => void;
  isMessagesLoading: boolean;
}

export const ChatPane: React.FC<ChatPaneProps> = ({
  activeChat,
  isResponding,
  isMessagesLoading,
  selectedModel,
  setSelectedModel,
  isSidebarOpen,
  setIsSidebarOpen,
  handleSendMessage,
  handleEditMessage,
  handleStopGeneration,
  userPlanId,
  onTriggerSubscription

}) => {
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // States for prompt edit & copy features
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const StreamingMessage = ({ text }: { text: string }) => {
    return (
      <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">
        {text}
      </pre>
    );
  };
  const handleStartEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    handleEditMessage(id, editText);
    setEditingId(null);
    setEditText('');
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Local static prompt suggestion chips
  const promptSuggestions = [
    { title: 'Secure SSO Implementation', text: 'How do I build security boundaries around Enterprise SSO routes?' },
    { title: 'Tailwind CSS v4 Setup', text: 'How can we use custom styles in Tailwind CSS v4 inline theme?' },
    { title: 'Google Sign-In Scopes', text: 'What scopes are best for Google Auth user integration?' },
    { title: 'Code: Alert Notification', text: 'Write a glassmorphism notification component in React.' }
  ];

  // Auto-scroll effect local to the chat workspace
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [activeChat.messages]);

  // Auto-resize textarea logic based on content
  useEffect(() => {
    const textarea = textInputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [inputMessage]);

  // Clean submission wrapper
  const handleLocalSubmit = (customText?: string) => {
    const text = customText || inputMessage;
    if (!text.trim()) return;

    // Lock image generation if the user's active plan does not permit it
    const isImageAllowed = hasPlanFeature(userPlanId, 'image_generation');
    if (!isImageAllowed && (text.toLowerCase().includes('image') || text.startsWith('/image'))) {
      onTriggerSubscription();
      return;
    }

    handleSendMessage(text);
    if (!customText) {
      setInputMessage('');
    }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 relative">

      {/* Workspace Top Header */}
      <header className="h-12 border-b border-white/5 bg-slate-950/20 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 lg:hidden text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="bg-slate-900 border border-white/10 hover:border-white/20 text-white rounded-xl text-xs font-semibold py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none"
              >
                <option value="deepseek-v3">🇨🇳 DeepSeek V3 (Default)</option>
                <option value="deepseek-r1">🧠 DeepSeek R1 (Reasoning)</option>
                <option value="claude-3-5-sonnet">🎭 Claude 3.5 Sonnet</option>
                <option value="gpt-4o">🤖 GPT-4o</option>
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
          <div className="flex items-center gap-1.5 px-3 py-1 max-sm:px-2 max-sm:py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="max-sm:hidden">Live Node Connected</span>
            <span className="sm:hidden text-[10px]">Live</span>
          </div>
        </div>
      </header>

      {/* CHAT MESSAGES DISPLAY */}
      <section className="flex-1 overflow-y-auto px-4 py-8 lg:px-12 space-y-6">

        {isMessagesLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
              <p className="text-zinc-400 text-sm">
                Loading conversation...
              </p>
            </div>
          </div>
        ) : (
          activeChat && activeChat.messages && activeChat.messages.length > 0 ? (
            activeChat.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 max-w-5xl mx-auto group ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant profile icon */}
                {msg.sender === 'assistant' && (
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px] flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.2)] max-sm:hidden">
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
                  {/* Floating Toolbar (User / Left side of bubble) */}
                  {editingId !== msg.id && msg.sender === 'user' && (
                    <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-950/95 border border-white/10 backdrop-blur-md rounded-xl p-1 flex items-center gap-1 shadow-2xl select-none z-20 max-lg:opacity-100 max-lg:relative max-lg:top-auto max-lg:right-auto max-lg:translate-y-0 max-lg:mr-0 max-lg:mt-2 max-lg:bg-transparent max-lg:border-0 max-lg:shadow-none max-lg:p-0 max-lg:justify-end">
                      <button
                        onClick={() => handleStartEdit(msg.id, msg.text)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer flex items-center justify-center max-lg:p-1 max-lg:text-white/70 max-lg:hover:bg-white/10"
                        title="Edit Prompt"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center max-lg:p-1 ${copiedId === msg.id
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5 max-lg:text-white/70 max-lg:hover:bg-white/10'
                          }`}
                        title="Copy Prompt"
                      >
                        {copiedId === msg.id ? (
                          <svg className="w-3.5 h-3.5 text-emerald-400 animate-scaleIn" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Floating Toolbar (Assistant / Right side of bubble) */}
                  {editingId !== msg.id && msg.sender === 'assistant' && (
                    <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-950/95 border border-white/10 backdrop-blur-md rounded-xl p-1 flex items-center gap-1 shadow-2xl select-none z-20 max-lg:opacity-100 max-lg:relative max-lg:top-auto max-lg:left-auto max-lg:translate-y-0 max-lg:ml-0 max-lg:mt-2 max-lg:bg-transparent max-lg:border-0 max-lg:shadow-none max-lg:p-0 max-lg:justify-start">
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center max-lg:p-1 ${copiedId === msg.id
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5 max-lg:text-zinc-400 max-lg:hover:bg-white/5'
                          }`}
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? (
                          <svg className="w-3.5 h-3.5 text-emerald-400 animate-scaleIn" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}

                  {editingId === msg.id ? (
                    <div className="flex flex-col gap-2.5 min-w-[280px] sm:min-w-[400px]">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/20 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y min-h-[60px] max-h-40"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(msg.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer"
                        >
                          Save & Submit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="chat-markdown font-sans leading-relaxed">
                      {msg.sender === "assistant" ? (
                        <>
                          {msg.isLoading && !msg.text && (
                            <div className="flex items-center gap-2 py-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-400 pulse-dot"></span>
                              <span className="w-2 h-2 rounded-full bg-purple-400 pulse-dot"></span>
                              <span className="w-2 h-2 rounded-full bg-cyan-400 pulse-dot"></span>

                              <span className="text-xs text-zinc-500">
                                Chatty AI is thinking...
                              </span>
                            </div>
                          )}

                          {msg.text && (
                            msg.isLoading
                              ? <StreamingMessage text={msg.text} />
                              : <MarkdownRenderer content={msg.text} />
                          )}
                        </>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      )}
                    </div>
                  )}

                  {editingId !== msg.id && (
                    <div className={`text-[10px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-indigo-200/60' : 'text-zinc-500'} font-medium select-none`}>
                      {msg.timestamp}
                    </div>
                  )}
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
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Chatty Workspace</h2>
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
          )
        )}



        <div ref={chatEndRef} />
      </section>

      {/* INPUT FORM COMPOSER */}
      <footer className="px-4 pb-4 pt-2 lg:px-8 lg:pb-6 lg:pt-2 bg-gradient-to-t from-[#080B11] via-[#080B11]/90 to-transparent">
        <div className="max-w-5xl mx-auto space-y-3">

          {/* Suggestion Chips visible only when active chat has few messages */}
          {activeChat && activeChat.messages && activeChat.messages.length <= 2 && (
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
              className="w-full pl-4 pr-24 py-3 bg-transparent border-0 text-white placeholder-zinc-500 text-sm focus:outline-none resize-none min-h-[44px] max-h-48 overflow-y-auto"
            />

            <div className="absolute right-3 bottom-2 flex items-center gap-2">

              {/* AI Image Generation Button */}
              <button
                type="button"
                onClick={() => {
                  const isImageAllowed = hasPlanFeature(userPlanId, 'image_generation');
                  if (!isImageAllowed) {
                    onTriggerSubscription();
                  } else {
                    handleLocalSubmit("/image " + inputMessage);
                  }
                }}
                disabled={!inputMessage.trim() || isResponding}
                className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                title="Generate AI Image"
              >
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              {isResponding ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="p-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer animate-fadeIn"
                  title="Stop Generating"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" strokeWidth={2} />
                  </svg>
                </button>
              ) : (
                /* Send Button */
                <button
                  type="button"
                  onClick={() => handleLocalSubmit()}
                  disabled={!inputMessage.trim()}
                  className={`
                    p-2 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer
                    ${inputMessage.trim()
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95'
                      : 'bg-zinc-800/40 text-zinc-600 pointer-events-none'}
                  `}
                  title="Send Message"
                >
                  <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              )}
            </div>

          </div>


        </div>
      </footer>

    </main>
  );
};
