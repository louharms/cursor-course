"use client";
import React, { useState, useRef } from "react";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  type: 'text' | 'image';
  imageUrl?: string;
}

export default function ChatDemoPage() {
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Generate unique message ID with counter to prevent duplicates
  const messageIdCounter = useRef(0);
  const generateMessageId = () => {
    messageIdCounter.current += 1;
    return `${Date.now()}-${messageIdCounter.current}`;
  };

  // Handle sending text messages with streaming
  const handleSendTextMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    
    // Add user message
    const userMessage: Message = {
      id: generateMessageId(),
      content: message,
      role: 'user',
      type: 'text'
    };
    setMessages(prev => [...prev, userMessage]);

    // Create assistant message placeholder
    const assistantMessageId = generateMessageId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      type: 'text'
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Use fetch with ReadableStream for streaming
      const response = await fetch('http://127.0.0.1:54321/functions/v1/chat-text', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body reader available');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsLoading(false);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix
            
            if (data === '[DONE]') {
              setIsLoading(false);
              reader.cancel();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: msg.content + parsed.content }
                    : msg
                ));
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (parseError) {
              console.error('Error parsing stream data:', parseError);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: '[Error: Failed to send message. Please try again.]' }
          : msg
      ));
      setIsLoading(false);
    }
  };

  // Handle sending image generation requests
  const handleSendImageMessage = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    
    // Add user message
    const userMessage: Message = {
      id: generateMessageId(),
      content: prompt,
      role: 'user',
      type: 'text'
    };
    setMessages(prev => [...prev, userMessage]);

    // Create assistant message placeholder
    const assistantMessageId = generateMessageId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: 'Generating image...',
      role: 'assistant',
      type: 'image'
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('http://127.0.0.1:54321/functions/v1/chat-image', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: `Generated image: ${prompt}`, imageUrl: data.imageUrl }
            : msg
        ));
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: `[Error: ${error instanceof Error ? error.message : 'Failed to generate image'}]` }
          : msg
      ));
    }
    
    setIsLoading(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    if (mode === 'text') {
      await handleSendTextMessage(message);
    } else {
      await handleSendImageMessage(message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">ChatGPT</h1>
          <div className="flex items-center">
            {/* New Chat Button */}
            <button
              onClick={() => setMessages([])}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              New Chat
            </button>
          </div>
        </div>
      </header>

      {/* Message List Container */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Start a conversation with ChatGPT</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">U</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zm-2.4787-11.1544a4.4708 4.4708 0 0 1 2.3331-1.9642v5.7705a.7663.7663 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0L2.4787 8.2762a4.4992 4.4992 0 0 1 .6649-5.5103zm16.5651 3.8899l-5.8428-3.3685V4.4444a.0804.0804 0 0 1 .0332-.0615l4.8426-2.7906a4.4992 4.4992 0 0 1 6.6802 4.66v5.5103a.7548.7548 0 0 0-.3927.6813zm2.0107-3.0231l-.142.0852-4.7735 2.7582a.7712.7712 0 0 0-.7854 0L9.8391 6.8605V4.5281a.0804.0804 0 0 1 .0332-.0615L14.7 1.6881a4.4992 4.4992 0 0 1 6.662 4.66zm-16.898 3.8704L8.73 9.0008a.071.071 0 0 1 .071 0l4.8426 2.7906v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 17.9502a4.4992 4.4992 0 0 1-6.1408-1.6464V11.9598a.7548.7548 0 0 0 .3927-.6813zm1.7436-2.6331L4.4969 7.5569a.7548.7548 0 0 0-.3927.6813v5.5826a4.4992 4.4992 0 0 0 6.6802 4.66l2.7962-1.6133a.071.071 0 0 1 .071 0l4.8426 2.7906a4.4992 4.4992 0 0 0 4.96-6.662 4.4992 4.4992 0 0 0-6.1408 1.6464z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-white border border-gray-600 text-gray-800'
                    }`}
                  >
                    {message.type === 'image' && message.imageUrl ? (
                      <div>
                        <p className="mb-2">{message.content}</p>
                        <img 
                          src={message.imageUrl} 
                          alt="Generated image" 
                          className="rounded-lg max-w-full h-auto"
                        />
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Input Area - ChatGPT Style */}
      <div className="bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="relative rounded-3xl border border-gray-300 bg-white focus-within:border-gray-400">
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'text' ? 'Message ChatGPT' : 'Describe the image you want to generate...'}
                className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-gray-900 placeholder-gray-500 focus:outline-none min-h-[44px] max-h-32 overflow-y-auto"
                rows={1}
                disabled={isLoading}
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            
            {/* Controls Row */}
            <div className="flex items-center justify-between px-3 pb-2">
              {/* Mode Toggle - Left Side */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setMode('text')}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    mode === 'text'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => setMode('image')}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    mode === 'image'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Image
                </button>
              </div>

              {/* Send Button - Right Side */}
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  isLoading || !input.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
          </form>
          
          {/* Bottom text like ChatGPT */}
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              ChatGPT can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
