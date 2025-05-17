import { supabase } from "./client";

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  client_id: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  type: "text" | "image";
  created_at: string;
}

export interface CreateMessageParams {
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  type: "text" | "image";
}

// Generate a unique client ID if one doesn't exist yet
export const getClientId = (): string => {
  const existingClientId = localStorage.getItem("chat_client_id");
  if (existingClientId) {
    return existingClientId;
  }

  const newClientId = crypto.randomUUID();
  localStorage.setItem("chat_client_id", newClientId);
  return newClientId;
};

// Get all conversations for the current client
export const getConversations = async (): Promise<Conversation[]> => {
  const clientId = getClientId();

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }

  return data || [];
};

// Create a new conversation
export const createConversation = async (
  title = "New Conversation"
): Promise<Conversation> => {
  const clientId = getClientId();

  const { data, error } = await supabase
    .from("conversations")
    .insert([{ title, client_id: clientId }])
    .select()
    .single();

  if (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }

  return data;
};

// Get messages for a specific conversation
export const getMessages = async (
  conversationId: string
): Promise<Message[]> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }

  return data || [];
};

// Create a new message
export const createMessage = async (
  params: CreateMessageParams
): Promise<Message> => {
  const { data, error } = await supabase
    .from("messages")
    .insert([params])
    .select()
    .single();

  if (error) {
    console.error("Error creating message:", error);
    throw error;
  }

  // Update the conversation's updated_at timestamp
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", params.conversation_id);

  return data;
};

// Create multiple messages in a batch
export const createMessages = async (
  messages: CreateMessageParams[]
): Promise<Message[]> => {
  if (messages.length === 0) return [];

  const { data, error } = await supabase
    .from("messages")
    .insert(messages)
    .select();

  if (error) {
    console.error("Error creating messages batch:", error);
    throw error;
  }

  // Update the conversation's updated_at timestamp (using the first message's conversation_id)
  const conversationId = messages[0].conversation_id;
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return data || [];
};

// Update conversation title
export const updateConversationTitle = async (
  id: string,
  title: string
): Promise<void> => {
  const { error } = await supabase
    .from("conversations")
    .update({ title })
    .eq("id", id);

  if (error) {
    console.error("Error updating conversation title:", error);
    throw error;
  }
};
