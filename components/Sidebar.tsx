"use client";

import React, { useState } from 'react';
import { ChatSession } from '@/types/chat';
import { PLANS } from './SubscriptionModal';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  MessageSquare, 
  LogOut, 
  Sparkles, 
  Compass
} from 'lucide-react';

interface SidebarProps {
  user: { 
    name: string; 
    email: string; 
    provider: 'google' | 'email-password'; 
    avatar_url?: string | null; 
    planId?: string;
  };
  activeChatId: string;
  setActiveChatId: (id: string) => void;
  chats: ChatSession[];
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  handleNewChat: () => void;
  handleLogout: () => void;
  handleDeleteChat: (id: string) => void;
  handleRenameChat: (id: string, newTitle: string) => void;
  onOpenSubscription?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeChatId,
  setActiveChatId,
  chats,
  isSidebarOpen,
  setIsSidebarOpen,
  handleNewChat,
  handleLogout,
  handleDeleteChat,
  handleRenameChat,
  onOpenSubscription
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatTitle, setEditingChatTitle] = useState('');

  // Perform search filtering locally inside the component
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (id: string, title: string) => {
    setEditingChatId(id);
    setEditingChatTitle(title);
  };

  const saveRename = (id: string) => {
    if (editingChatTitle.trim()) {
      handleRenameChat(id, editingChatTitle.trim());
    }
    setEditingChatId(null);
  };

  const cancelRename = () => {
    setEditingChatId(null);
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-72 bg-[#090D16]/95 border-r border-white/10 backdrop-blur-2xl flex flex-col transition-transform duration-300 ease-out
      lg:static lg:translate-x-0
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Workspace Brand Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <div className="h-full w-full bg-slate-950 rounded-xl flex items-center justify-center">
              <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              Chatty Core
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]"></span>
            </h2>
            <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-semibold px-1.5 py-0.5 rounded-md tracking-wider uppercase">
              {user.provider === 'google' ? 'Google Auth' : 'Verified Member'}
            </span>
          </div>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat & Composer Trigger */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="relative w-full overflow-hidden group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.2)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.35)] transition-all duration-300 cursor-pointer"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Search through Chats */}
      <div className="px-4 mb-2">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="w-4 h-4 text-zinc-500" />
          </span>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 bg-slate-900/30 border border-white/5 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/40 rounded-xl text-xs text-white placeholder-zinc-500 transition-all duration-200"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-4 py-2 custom-scrollbar">
        <div>
          <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <span>Conversations</span>
            <span className="text-[9px] bg-slate-900/50 border border-white/5 text-zinc-500 px-2 py-0.5 rounded-full font-mono">
              {filteredChats.length}
            </span>
          </div>
          <div className="mt-1.5 space-y-1">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  if (editingChatId !== chat.id) {
                    setActiveChatId(chat.id);
                    setIsSidebarOpen(false);
                  }
                }}
                className={`
                  group w-full flex items-center justify-between rounded-xl p-3 text-left text-xs transition-all duration-200 cursor-pointer
                  ${chat.id === activeChatId 
                    ? 'bg-gradient-to-r from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]' 
                    : 'hover:bg-white/[0.02] border border-transparent text-zinc-400 hover:text-zinc-200 hover:translate-x-0.5'}
                `}
              >
                {editingChatId === chat.id ? (
                  <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingChatTitle}
                      onChange={(e) => setEditingChatTitle(e.target.value)}
                      className="flex-1 bg-slate-950/80 border border-white/10 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500/40"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename(chat.id);
                        if (e.key === 'Escape') cancelRename();
                      }}
                    />
                    <button 
                      onClick={() => saveRename(chat.id)}
                      className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={cancelRename}
                      className="p-1 text-zinc-400 hover:bg-white/5 rounded-md transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare className={`w-4 h-4 flex-shrink-0 transition-colors ${chat.id === activeChatId ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                      <span className="truncate">{chat.title}</span>
                    </div>
                    
                    {/* Hover Action Buttons */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pl-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(chat.id, chat.title);
                        }}
                        className="p-1 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all duration-150 cursor-pointer"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-150 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {filteredChats.length === 0 && (
              <div className="px-3 py-6 text-xs text-zinc-600 text-center flex flex-col items-center gap-1.5">
                <MessageSquare className="w-5 h-5 text-zinc-700" />
                <span>No conversations found</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Identity & Logout panel */}
      <div className="p-4 border-t border-white/5 bg-slate-950/40 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4 p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 shadow-md">
          {user.avatar_url ? (
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1.5px] flex-shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.15)]">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar_url}`}
                alt={user.name}
                className="h-full w-full rounded-full object-cover bg-slate-950"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1.5px] flex-shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.15)]">
              <div className="h-full w-full rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold tracking-wider text-xs">
                {user.email.slice(0, 2).toUpperCase()}
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate leading-none mb-1">{user.name}</p>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
              <span className="text-[9px] font-semibold text-zinc-400 truncate tracking-wide">
                {user.email}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {(() => {
                const activePlan = PLANS.find(p => p.id === user.planId) || PLANS[0];
                return (
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                    activePlan.id !== 'free' 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                      : 'bg-zinc-800 text-zinc-400 border border-white/5'
                  }`}>
                    {activePlan.name}
                  </span>
                );
              })()}
              {onOpenSubscription && (
                <button
                  type="button"
                  onClick={onOpenSubscription}
                  className="text-[8px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer underline decoration-indigo-500/30"
                >
                  Manage
                </button>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 text-zinc-300 hover:text-rose-400 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_2px_10px_rgba(244,63,94,0.15)]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
