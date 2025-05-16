"use client";
import React, { useState, useEffect, KeyboardEvent, useRef } from "react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "image";
}

export default function ChatDemoPage() {
  // State for messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hello! How can I help you today?",
      type: "text",
    },
    {
      id: 2,
      role: "user",
      content: "Can you tell me about the weather?",
      type: "text",
    },
    {
      id: 3,
      role: "assistant",
      content:
        "I don't have real-time weather data, but I can help you find weather information or answer other questions you might have.",
      type: "text",
    },
    {
      id: 4,
      role: "user",
      content: "How about creating an image of a sunny day?",
      type: "text",
    },
    {
      id: 5,
      role: "assistant",
      content:
        "I'd be happy to create an image of a sunny day for you! Just switch to image mode using the toggle below and describe what you'd like to see.",
      type: "text",
    },
  ]);

  // State for input field
  const [input, setInput] = useState("");

  // State for mode toggle (text or image)
  const [isImageMode, setIsImageMode] = useState(false);

  // State for handling loading state
  const [isLoading, setIsLoading] = useState(false);

  // Reference to message container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Simulate AI response
  const getAIResponse = (
    userInput: string,
    isImage: boolean
  ): Promise<string> => {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        if (isImage) {
          resolve(`Here's an AI-generated image based on: "${userInput}"`);
        } else {
          // Simple response logic
          if (userInput.toLowerCase().includes("weather")) {
            resolve(
              "I don't have access to real-time weather data, but you can check a weather service like weather.com for current conditions."
            );
          } else if (
            userInput.toLowerCase().includes("hello") ||
            userInput.toLowerCase().includes("hi")
          ) {
            resolve("Hello there! How can I assist you today?");
          } else if (userInput.toLowerCase().includes("help")) {
            resolve(
              "I can help answer questions, provide information, or generate images in image mode. What would you like to know?"
            );
          } else if (userInput.toLowerCase().includes("image")) {
            resolve(
              "To create an image, click the 'Create image' button on the left of the input field, then describe the image you'd like me to generate."
            );
          } else {
            resolve(
              `I received your message: "${userInput}". How can I help you further with this?`
            );
          }
        }
      }, 1000); // 1 second delay to simulate thinking/processing
    });
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);

    // Generate a new ID
    const newId =
      messages.length > 0 ? Math.max(...messages.map((m) => m.id)) + 1 : 1;

    // Add user message
    const userMessage: Message = {
      id: newId,
      role: "user",
      content: input,
      type: isImageMode ? "image" : "text",
    };

    // Update messages with user message
    setMessages([...messages, userMessage]);

    // Clear input field
    setInput("");

    // Get AI response
    try {
      const responseContent = await getAIResponse(input, isImageMode);

      // Add assistant response
      const assistantMessage: Message = {
        id: newId + 1,
        role: "assistant",
        content: responseContent,
        type: isImageMode ? "image" : "text",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Handle error
      const errorMessage: Message = {
        id: newId + 1,
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        type: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-bold text-gray-800">
            GPT-Powered Chatbot
          </h1>
        </div>
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
                  {message.content}
                  {message.type === "image" && message.role === "assistant" && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-500">
                      [Image would be displayed here in a real implementation]
                    </div>
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
                disabled={!input.trim() || isLoading}
                className={`p-2 mx-2 rounded-full ${
                  input.trim() && !isLoading
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
  );
}
