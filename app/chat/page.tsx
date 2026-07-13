"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChatSession, Message } from '@/types/chat';
import { Sidebar } from '../../components/Sidebar';
import { ChatPane } from '../../components/ChatPane';
import { SubscriptionModal } from '../../components/SubscriptionModal';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { logoutUser } from '@/redux/slices/authSlice';
import {
  fetchConversations,
  createConversation,
  fetchConversationDetail,
  renameConversation,
  deleteConversation,
  sendMessageStream,
  editMessageStream
} from '@/api/conversations';

export default function ChatPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, planId, isInitialized } = useAppSelector((state) => state.auth);

  // Chat-related state
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isResponding, setIsResponding] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'deepseek-v3' | 'deepseek-r1' | 'claude-3-5-sonnet' | 'gpt-4o'>('deepseek-v3');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Abort and typing refs for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeAssistantMsgRef = useRef<Message | null>(null);
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id !== activeChatId) return chat;

        return {
          ...chat,
          messages: chat.messages.filter(msg => {
            if (msg.sender !== "assistant") return true;

            return msg.text.trim() !== "";
          }),
        };
      })
    );

    setIsResponding(false);
  };

  // Redirect to login if session is unauthenticated
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [isInitialized, user, router]);

  // Load user conversation list on initialization
  useEffect(() => {
    if (isInitialized && user) {
      loadConversations();
    }
  }, [isInitialized, user]);

  // Dynamically load conversation details when active chat selection changes
  useEffect(() => {
    if (activeChatId) {
      fetchChatDetails(activeChatId);
    }
  }, [activeChatId]);

  const loadConversations = async () => {
    setIsChatsLoading(true);
    try {
      const data = await fetchConversations();
      const formattedChats = data.map(chat => ({
        ...chat,
        messages: chat.messages || []
      }));
      setChats(formattedChats);
      if (formattedChats.length > 0) {
        setActiveChatId(formattedChats[0].id);
      } else {
        const newChat = await createConversation();
        setChats([{ ...newChat, messages: newChat.messages || [] }]);
        setActiveChatId(newChat.id);
      }
    } catch (e) {
      console.error("Failed to load conversations:", e);
    } finally {
      setIsChatsLoading(false);
    }
  };

  const fetchChatDetails = async (id: string) => {
    setIsMessagesLoading(true);

    try {
      const detail = await fetchConversationDetail(id);

      setChats(prev =>
        prev.map(chat =>
          chat.id === id
            ? {
              ...detail,
              messages: detail.messages || []
            }
            : chat
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const refreshConversationsList = async () => {
    try {
      const data = await fetchConversations();
      setChats(prev => data.map(chat => {
        const match = prev.find(p => p.id === chat.id);
        return match
          ? { ...chat, messages: match.messages || [] }
          : { ...chat, messages: [] };
      }));
    } catch (e) {
      console.error("Failed to refresh conversation list:", e);
    }
  };

  const currentUser = {
    name: user?.full_name || 'Anonymous User',
    email: user?.email || 'no-email@chat.com',
    provider: 'email-password' as const,
    avatar_url: user?.avatar_url,
    planId: planId
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isResponding || !activeChatId) return;

    const tempUserMsg: Message = {
      id: `msg-user-temp-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };



    setIsResponding(true);

    const tempAssistantMsg: Message = {
      id: `msg-ai-temp-${Date.now()}`,
      sender: "assistant",
      text: "",
      timestamp: "",
      isLoading: true,
    };;

    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id !== activeChatId) return chat;

        return {
          ...chat,
          messages: [
            ...(chat.messages || []),
            tempUserMsg,
            tempAssistantMsg,
          ],
        };
      })
    );

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedText = "";
    let assistantMsgId = "";

    try {
      await sendMessageStream(
        activeChatId,
        text,
        {
          onUserMessage: (dbUserMsg) => {
            setChats(prevChats =>
              prevChats.map(chat => {
                if (chat.id !== activeChatId) return chat;

                return {
                  ...chat,
                  messages: chat.messages.map(msg =>
                    msg.id === tempUserMsg.id
                      ? dbUserMsg
                      : msg
                  )
                };
              })
            );
          },
          onAssistantStart: (dbAssistantMsg) => {
            assistantMsgId = dbAssistantMsg.id;

            setChats(prevChats =>
              prevChats.map(chat => {
                if (chat.id !== activeChatId) return chat;

                return {
                  ...chat,
                  messages: chat.messages.map(msg =>
                    msg.id === tempAssistantMsg.id
                      ? {
                        ...dbAssistantMsg,
                        isLoading: true,
                      }
                      : msg
                  )
                };
              })
            );
          },
          onContent: (chunk) => {
            accumulatedText += chunk;
            setChats(prevChats =>
              prevChats.map(chat => {
                if (chat.id === activeChatId) {
                  return {
                    ...chat,
                    messages: chat.messages.map(msg =>
                      msg.id === assistantMsgId
                        ? {
                          ...msg,
                          text: accumulatedText + " ▌",
                          isLoading: true,
                        }
                        : msg
                    )
                  };
                }

                return chat;
              })
            );
          },
          onDone: (dbAssistantMsg) => {
            activeAssistantMsgRef.current = dbAssistantMsg;
            setChats(prevChats =>
              prevChats.map(chat => {
                if (chat.id === activeChatId) {
                  return {
                    ...chat,
                    messages: chat.messages.map(msg =>
                      msg.id === assistantMsgId
                        ? {
                          ...dbAssistantMsg,
                          isLoading: false,
                        }
                        : msg
                    )
                  };
                }
                return chat;
              })
            );
            refreshConversationsList();
          }
        },
        controller.signal
      );
    } catch (e: any) {
      if (e.name === 'AbortError' || e.name === 'CanceledError' || e.code === 'ERR_CANCELED') {
        console.log("Send message canceled");

        setChats(prevChats =>
          prevChats.map(chat => {
            if (chat.id !== activeChatId) return chat;

            const nextMessages = [...chat.messages];
            const lastIdx = nextMessages.length - 1;

            if (lastIdx >= 0 && nextMessages[lastIdx].sender === "assistant") {
              if (accumulatedText.trim()) {
                nextMessages[lastIdx] = {
                  ...nextMessages[lastIdx],
                  text: accumulatedText,
                  isLoading: false,
                };
              } else {
                nextMessages.pop();
              }
            }

            return {
              ...chat,
              messages: nextMessages,
            };
          })
        );
      } else {
        console.error("Failed to send message stream:", e);
        setChats(prevChats =>
          prevChats.map(chat => {
            if (chat.id === activeChatId) {
              const hasAssistant = (chat.messages || []).some(m => m.sender === 'assistant' && m.id === assistantMsgId);
              if (!hasAssistant) {
                return {
                  ...chat,
                  messages: (chat.messages || []).filter(m => m.id !== tempUserMsg.id)
                };
              }
            }
            return chat;
          })
        );
      }
      refreshConversationsList();
    } finally {
      setIsResponding(false);
      abortControllerRef.current = null;
    }
  };

  const handleEditMessage = async (messageId: string, text: string) => {
    if (!text.trim() || isResponding || !activeChatId) return;

    // Instantly truncate downstream messages in the client UI for a fast, responsive feel
    const tempAssistantMsg: Message = {
      id: `temp-edit-ai-${Date.now()}`,
      sender: "assistant",
      text: "",
      timestamp: "",
      isLoading: true,
    };

    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id !== activeChatId) return chat;

        const messages = chat.messages || [];
        const idx = messages.findIndex(m => m.id === messageId);

        if (idx === -1) return chat;

        const updatedUser = {
          ...messages[idx],
          text,
        };

        return {
          ...chat,
          messages: [
            ...messages.slice(0, idx),
            updatedUser,
            tempAssistantMsg,
          ],
        };
      })
    );

    setIsResponding(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let assistantMsgId = "";
    let accumulatedText = "";

    try {
      await editMessageStream(
        activeChatId,
        messageId,
        text,
        {
          onHistory: (historyMessages) => {
            console.log("History:", historyMessages);

            setChats(prevChats =>
              prevChats.map(chat => {
                if (chat.id !== activeChatId) return chat;

                return {
                  ...chat,
                  messages: historyMessages.map(m => ({
                    ...m,
                    isLoading: false,
                  })),
                };
              })
            );
          },
          onAssistantStart: (dbAssistantMsg) => {
            console.log("Assistant Start:", dbAssistantMsg);

            assistantMsgId = dbAssistantMsg.id;
            activeAssistantMsgRef.current = dbAssistantMsg;

            setChats(prevChats =>
              prevChats.map(chat => {
                if (chat.id !== activeChatId) return chat;

                return {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    {
                      ...dbAssistantMsg,
                      isLoading: true,
                    },
                  ],
                };
              })
            );
          },
          onContent: (chunk) => {
            accumulatedText += chunk;

            setChats(prevChats =>
              prevChats.map(chat => {
                if (chat.id !== activeChatId) return chat;

                const messages = [...chat.messages];

                const index = messages.findIndex(
                  m => m.id === assistantMsgId
                );

                if (index === -1) return chat;

                messages[index] = {
                  ...messages[index],
                  text: accumulatedText + " ▌",
                  isLoading: true,
                };

                return {
                  ...chat,
                  messages,
                };
              })
            );
          },
          onDone: (dbAssistantMsg) => {
            setChats(prevChats =>
              prevChats.map(chat => {
                if (chat.id !== activeChatId) return chat;

                const messages = [...chat.messages];

                const index = messages.findIndex(
                  m => m.id === assistantMsgId
                );

                if (index === -1) return chat;

                messages[index] = {
                  ...dbAssistantMsg,
                  isLoading: false,
                };

                return {
                  ...chat,
                  messages,
                };
              })
            );

            refreshConversationsList();
          },
        },
        controller.signal
      );
    } catch (e: any) {
      if (e.name === 'AbortError' || e.name === 'CanceledError' || e.code === 'ERR_CANCELED') {
        console.log("Edit message canceled");
        setChats(prevChats =>
          prevChats.map(chat => {
            if (chat.id === activeChatId) {
              const nextMessages = [...(chat.messages || [])];
              const lastIdx = nextMessages.length - 1;
              if (nextMessages[lastIdx] && nextMessages[lastIdx].sender === 'assistant') {
                nextMessages[lastIdx] = {
                  ...nextMessages[lastIdx],
                  text: accumulatedText
                };
              }
              return { ...chat, messages: nextMessages };
            }
            return chat;
          })
        );
      } else {
        console.error("Failed to edit message stream:", e);
      }
      refreshConversationsList();
    } finally {
      setIsResponding(false);
      abortControllerRef.current = null;
    }
  };

  const handleNewChat = async () => {
    try {
      const newSession = await createConversation();
      setChats(prev => [newSession, ...prev]);
      setActiveChatId(newSession.id);
      setIsSidebarOpen(false);
    } catch (e) {
      console.error("Failed to start new conversation:", e);
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      await deleteConversation(id);
      const updatedChats = chats.filter(chat => chat.id !== id);
      if (updatedChats.length === 0) {
        const newSession = await createConversation();
        setChats([newSession]);
        setActiveChatId(newSession.id);
      } else {
        setChats(updatedChats);
        if (activeChatId === id) {
          setActiveChatId(updatedChats[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to delete conversation:", e);
    }
  };

  const handleRenameChat = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      await renameConversation(id, newTitle);
      setChats(prev => prev.map(chat => chat.id === id ? { ...chat, title: newTitle } : chat));
    } catch (e) {
      console.error("Failed to rename conversation:", e);
    }
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    dispatch(logoutUser());
    router.push('/login');
  };

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0] || {
    id: '',
    title: '✨ New AI Conversation',
    category: 'Recent',
    messages: []
  };

  const handleSetActiveChatId = (id: string) => {
    setActiveChatId(id);
  };

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

  return (
    <div className="flex h-screen w-full bg-[#080B11] text-zinc-100 overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-72 w-[600px] h-[600px] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none"></div>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      <Sidebar
        user={currentUser}
        activeChatId={activeChatId || ''}
        setActiveChatId={handleSetActiveChatId}
        chats={chats}
        isChatsLoading={isChatsLoading}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleNewChat={handleNewChat}
        handleLogout={handleLogout}
        handleDeleteChat={handleDeleteChat}
        handleRenameChat={handleRenameChat}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
      />

      <ChatPane
        activeChat={activeChat}
        isResponding={isResponding}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleSendMessage={handleSendMessage}
        handleEditMessage={handleEditMessage}
        handleStopGeneration={handleStopGeneration}
        isMessagesLoading={isMessagesLoading}
        userPlanId={planId}
        onTriggerSubscription={() => setIsSubscriptionModalOpen(true)}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

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
