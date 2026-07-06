import api from "@/config/axios";
import { ChatSession, Message } from "@/types/chat";
import { getCookie } from "@/utils/cookies";

export async function fetchConversations(): Promise<ChatSession[]> {
  const response = await api.get<ChatSession[]>("/conversations");
  return response.data;
}

export async function createConversation(title?: string): Promise<ChatSession> {
  const response = await api.post<ChatSession>("/conversations", { title });
  return response.data;
}

export async function fetchConversationDetail(id: string): Promise<ChatSession> {
  const response = await api.get<ChatSession>(`/conversations/${id}`);
  return response.data;
}

export async function renameConversation(id: string, title: string): Promise<ChatSession> {
  const response = await api.put<ChatSession>(`/conversations/${id}`, { title });
  return response.data;
}

export async function deleteConversation(id: string): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/conversations/${id}`);
  return response.data;
}

export interface StreamCallbacks {
  onUserMessage?: (msg: Message) => void;
  onAssistantStart?: (msg: Message) => void;
  onContent?: (chunk: string) => void;
  onHistory?: (messages: Message[]) => void;
  onDone?: (msg: Message) => void;
}

export async function sendMessageStream(
  sessionId: string,
  text: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const token = getCookie("token");
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const url = `${baseUrl}/api/conversations/${sessionId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ text }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body reader available.");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    let currentEvent = "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith("event:")) {
        currentEvent = trimmed.replace("event:", "").trim();
      } else if (trimmed.startsWith("data:")) {
        const rawData = trimmed.replace("data:", "").trim();
        try {
          const parsed = JSON.parse(rawData);
          if (currentEvent === "user_message" && callbacks.onUserMessage) {
            callbacks.onUserMessage(parsed);
          } else if (currentEvent === "assistant_message_start" && callbacks.onAssistantStart) {
            callbacks.onAssistantStart(parsed);
          } else if (currentEvent === "content" && callbacks.onContent) {
            callbacks.onContent(parsed);
          } else if (currentEvent === "history" && callbacks.onHistory) {
            callbacks.onHistory(parsed);
          } else if (currentEvent === "done" && callbacks.onDone) {
            callbacks.onDone(parsed);
          }
        } catch (err) {
          console.error("Failed to parse SSE event data:", rawData, err);
        }
      }
    }
  }
}

export async function editMessageStream(
  sessionId: string,
  messageId: string,
  text: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const token = getCookie("token");
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const url = `${baseUrl}/api/conversations/${sessionId}/messages/${messageId}/edit`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ text }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body reader available.");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    let currentEvent = "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith("event:")) {
        currentEvent = trimmed.replace("event:", "").trim();
      } else if (trimmed.startsWith("data:")) {
        const rawData = trimmed.replace("data:", "").trim();
        try {
          const parsed = JSON.parse(rawData);
          if (currentEvent === "user_message" && callbacks.onUserMessage) {
            callbacks.onUserMessage(parsed);
          } else if (currentEvent === "assistant_message_start" && callbacks.onAssistantStart) {
            callbacks.onAssistantStart(parsed);
          } else if (currentEvent === "content" && callbacks.onContent) {
            callbacks.onContent(parsed);
          } else if (currentEvent === "history" && callbacks.onHistory) {
            callbacks.onHistory(parsed);
          } else if (currentEvent === "done" && callbacks.onDone) {
            callbacks.onDone(parsed);
          }
        } catch (err) {
          console.error("Failed to parse SSE event data:", rawData, err);
        }
      }
    }
  }
}
