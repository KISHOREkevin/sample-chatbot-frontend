export interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  category: 'Recent' | 'Yesterday' | 'Previous';
  messages: Message[];
  created_at?: string;
  updated_at?: string;
}
