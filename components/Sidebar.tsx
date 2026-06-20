"use client";

import React, { useState } from 'react';
import { ChatSession } from '../app/sampleData';

interface SidebarProps {
  user: { name: string; email: string; provider: 'google' | 'email-password' };
  activeChatId: string;
  setActiveChatId: (id: string) => void;
  chats: ChatSession[];
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  handleNewChat: () => void;
  handleLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeChatId,
  setActiveChatId,
  chats,
  isSidebarOpen,
  setIsSidebarOpen,
  handleNewChat,
  handleLogout
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Perform search filtering locally inside the component
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-80 bg-slate-950/80 border-r border-white/5 backdrop-blur-2xl flex flex-col transition-transform duration-300 ease-out
      lg:static lg:translate-x-0
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Workspace Brand Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px]">
            <div className="h-full w-full bg-slate-950 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Aegis Core</h2>
            <span className="text-[10px] text-cyan-400 font-semibold tracking-widest uppercase">
              {user.provider === 'google' ? 'Google Client' : 'Verified Member'}
            </span>
          </div>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* New Chat & Composer Trigger */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/10 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Conversation
        </button>
      </div>

      {/* Search through Chats */}
      <div className="px-4 mb-2">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search chat history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-white/5 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2">
        
        {/* Recent */}
        <div>
          <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Conversations</div>
          <div className="mt-1.5 space-y-0.5">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm transition-all duration-150 cursor-pointer
                  ${chat.id === activeChatId 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-white font-medium' 
                    : 'hover:bg-white/[0.03] border border-transparent text-zinc-400 hover:text-zinc-200'}
                `}
              >
                <svg className={`w-4 h-4 flex-shrink-0 ${chat.id === activeChatId ? 'text-indigo-400' : 'text-zinc-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="truncate flex-1">{chat.title}</span>
              </button>
            ))}
            {filteredChats.length === 0 && (
              <div className="px-3 py-4 text-xs text-zinc-600 text-center">
                No matching chats found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Identity & Logout panel */}
      <div className="p-4 border-t border-white/5 bg-slate-950/90">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold tracking-wider text-sm shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            {user.email.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide truncate">
                {user.provider === 'email-password' ? 'Email Verified' : 'Google Verified'}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 text-zinc-300 hover:text-rose-400 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Disconnect Credentials
        </button>
      </div>
    </aside>
  );
};
