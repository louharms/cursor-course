"use client";
import React, { useState, useEffect, KeyboardEvent, useRef } from "react";
import {
  getConversations,
  createConversation,
  getMessages,
  createMessage,
  Conversation,
  Message as ChatMessage,
} from "@/lib/supabase/chat";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "image";
}

export default function ChatDemoPage() {
  // State for messages
  const [messages, setMessages] = useState<Message[]>([]);

  // State for conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // State for input field
  const [input, setInput] = useState("");

  // State for mode toggle (text or image)
  const [isImageMode, setIsImageMode] = useState(false);

  // State for handling loading state
  const [isLoading, setIsLoading] = useState(false);

  // Reference to message container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on component mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const conversationList = await getConversations();
        setConversations(conversationList);

        // If we have conversations, select the most recent one
        if (conversationList.length > 0) {
          setCurrentConversation(conversationList[0]);
        } else {
          // If no conversations exist, create a new one
          const newConversation = await createConversation();
          setConversations([newConversation]);
          setCurrentConversation(newConversation);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };

    loadConversations();
  }, []);

  // Load messages when current conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentConversation) return;

      try {
        const messageList = await getMessages(currentConversation.id);

        // Convert database messages to UI message format
        const uiMessages = messageList.map((msg, index) => ({
          id: index + 1, // Use sequential IDs for the UI
          role: msg.role,
          content: msg.content,
          type: msg.type,
        }));

        setMessages(uiMessages);

        // If no messages, add a welcome message
        if (uiMessages.length === 0) {
          setMessages([
            {
              id: 1,
              role: "assistant",
              content: "Hello! How can I help you today?",
              type: "text",
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();
  }, [currentConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Create a new conversation
  const handleNewConversation = async () => {
    try {
      const newConversation = await createConversation();
      setConversations([newConversation, ...conversations]);
      setCurrentConversation(newConversation);
      setMessages([
        {
          id: 1,
          role: "assistant",
          content: "Hello! How can I help you today?",
          type: "text",
        },
      ]);
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  };

  // Select a conversation
  const handleSelectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setShowSidebar(false);
  };

  // Get AI response for image generation only
  const getAIResponse = async (
    userInput: string,
    isImage: boolean
  ): Promise<string> => {
    try {
      if (!isImage) {
        throw new Error(
          "This function should only be used for image generation"
        );
      }

      // Call image generation edge function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/image-generation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANON_KEY}`,
          },
          body: JSON.stringify({ prompt: userInput }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return `Here's an AI-generated image: ${data.imageUrl}`;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "Sorry, I encountered an error processing your image request. Please try again.";
    }
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !currentConversation) return;

    setIsLoading(true);

    // Generate a new ID for UI
    const newId =
      messages.length > 0 ? Math.max(...messages.map((m) => m.id)) + 1 : 1;

    // Add user message to UI
    const userMessage: Message = {
      id: newId,
      role: "user",
      content: input,
      type: isImageMode ? "image" : "text",
    };

    // Update messages UI
    setMessages([...messages, userMessage]);

    // Save user message to database
    try {
      await createMessage({
        conversation_id: currentConversation.id,
        role: "user",
        content: input,
        type: isImageMode ? "image" : "text",
      });

      // Clear input field
      setInput("");

      if (isImageMode) {
        // Handle image generation (non-streaming)
        const responseContent = await getAIResponse(input, isImageMode);

        // Add assistant response to UI
        const assistantMessage: Message = {
          id: newId + 1,
          role: "assistant",
          content: responseContent,
          type: "image",
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Save assistant message to database
        await createMessage({
          conversation_id: currentConversation.id,
          role: "assistant",
          content: responseContent,
          type: "image",
        });
      } else {
        // For text chat, immediately add an empty assistant message that we'll fill incrementally
        const assistantMessage: Message = {
          id: newId + 1,
          role: "assistant",
          content: "",
          type: "text",
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Call chat completion edge function directly here for streaming updates
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat-completion`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANON_KEY}`,
              },
              body: JSON.stringify({
                messages: [{ role: "user", content: input }],
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to get response");
          }

          // Process the streaming response
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("Failed to get response stream");
          }

          const decoder = new TextDecoder();
          let fullResponse = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            // Process each event in the chunk
            for (const line of chunk.split("\n")) {
              if (line.startsWith("data: ")) {
                if (line === "data: [DONE]") {
                  continue;
                }

                try {
                  const data = JSON.parse(line.substring(6));
                  if (data.content) {
                    fullResponse += data.content;

                    // Update the assistant message with each new token
                    setMessages((prevMessages) => {
                      const updatedMessages = [...prevMessages];
                      const lastMessageIndex = updatedMessages.length - 1;

                      if (
                        lastMessageIndex >= 0 &&
                        updatedMessages[lastMessageIndex].role === "assistant"
                      ) {
                        updatedMessages[lastMessageIndex] = {
                          ...updatedMessages[lastMessageIndex],
                          content:
                            updatedMessages[lastMessageIndex].content +
                            data.content,
                        };
                      }

                      return updatedMessages;
                    });
                  }
                } catch (e) {
                  // Skip parse errors for incomplete chunks
                  console.warn("Failed to parse SSE chunk", e);
                }
              }
            }
          }

          // When done streaming, save the complete assistant message to the database
          if (fullResponse) {
            await createMessage({
              conversation_id: currentConversation.id,
              role: "assistant",
              content: fullResponse,
              type: "text",
            });
          }
        } catch (error) {
          console.error("Streaming error:", error);
          // Update the last message with error information
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const lastMessageIndex = updatedMessages.length - 1;

            if (
              lastMessageIndex >= 0 &&
              updatedMessages[lastMessageIndex].role === "assistant"
            ) {
              updatedMessages[lastMessageIndex] = {
                ...updatedMessages[lastMessageIndex],
                content:
                  "Sorry, I encountered an error processing your request. Please try again.",
              };
            }

            return updatedMessages;
          });

          // Save error message to database
          await createMessage({
            conversation_id: currentConversation.id,
            role: "assistant",
            content:
              "Sorry, I encountered an error processing your request. Please try again.",
            type: "text",
          });
        }
      }
    } catch (error) {
      console.error("Error in message handling:", error);
      // Add error message to UI
      const errorMessage: Message = {
        id: newId + 1,
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        type: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);

      // Try to save error message to database
      try {
        await createMessage({
          conversation_id: currentConversation.id,
          role: "assistant",
          content:
            "Sorry, I encountered an error processing your request. Please try again.",
          type: "text",
        });
      } catch (dbError) {
        console.error("Failed to save error message to database:", dbError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press for Enter key
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle between text and image modes
  const toggleMode = () => {
    setIsImageMode(!isImageMode);
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 z-10 transition duration-200 ease-in-out 
        bg-gray-800 w-64 md:w-72 md:flex md:flex-col`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Conversations</h2>
          <button
            onClick={handleNewConversation}
            className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`p-3 cursor-pointer hover:bg-gray-700 flex items-center ${
                currentConversation?.id === conversation.id ? "bg-gray-700" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1 truncate">
                <span className="text-gray-200">{conversation.title}</span>
                <div className="text-gray-400 text-xs">
                  {new Date(conversation.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 py-4 px-4 flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-4 md:hidden text-gray-500 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {currentConversation?.title || "GPT-Powered Chatbot"}
          </h1>
        </header>

        <main className="flex-1 container mx-auto px-4 py-6 flex flex-col">
          {/* Chat container */}
          <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col max-w-4xl mx-auto overflow-hidden">
            {/* Message display area */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {message.type === "image" &&
                    message.role === "assistant" ? (
                      <div>
                        <p className="mb-2">
                          {
                            message.content.split(
                              "Here's an AI-generated image:"
                            )[0]
                          }
                        </p>
                        {message.content.includes("AI-generated image:") && (
                          <div className="mt-2">
                            <img
                              src={message.content
                                .split("Here's an AI-generated image:")[1]
                                ?.trim()}
                              alt="AI generated image"
                              className="rounded-md max-w-full"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                  "https://via.placeholder.com/300x200?text=Image+Load+Error";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area - now with ChatGPT style */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center rounded-md border border-gray-300 bg-white">
                {/* Actions row on the left */}
                <div className="flex items-center px-3">
                  {/* Create Image button/toggle */}
                  <button
                    onClick={toggleMode}
                    className={`flex items-center px-3 py-2 rounded-md text-sm transition ${
                      isImageMode
                        ? "bg-blue-100 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Create image
                  </button>

                  {/* Additional action buttons could be added here */}
                </div>

                {/* Input field */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isImageMode
                      ? "Describe the image you want..."
                      : "Type a message..."
                  }
                  disabled={isLoading}
                  className="flex-1 py-3 px-3 outline-none text-gray-800"
                />

                {/* Send button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading || !currentConversation}
                  className={`p-2 mx-2 rounded-full ${
                    input.trim() && !isLoading && currentConversation
                      ? "text-blue-500 hover:bg-blue-50"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
