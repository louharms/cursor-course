"use client";
import React, { useState } from "react";

export default function ChatDemoPage() {
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    type: 'text' | 'image';
  }>>([
    {
      id: '1',
      content: 'Hello! Can you help me understand how React hooks work?',
      role: 'user',
      type: 'text'
    },
    {
      id: '2',
      content: 'Of course! React hooks are functions that let you use state and other React features in functional components. The most common ones are useState for managing state and useEffect for side effects. Would you like me to explain a specific hook or show you an example?',
      role: 'assistant',
      type: 'text'
    },
    {
      id: '3',
      content: 'That\'s helpful! Can you show me a simple useState example?',
      role: 'user',
      type: 'text'
    },
    {
      id: '4',
      content: 'Absolutely! Here\'s a simple counter example:\n\n```jsx\nimport React, { useState } from \'react\';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}\n```\n\nThe useState hook returns an array with two elements: the current state value and a function to update it.',
      role: 'assistant',
      type: 'text'
    },
    {
      id: '5',
      content: 'Perfect! Now can you create an image of a cute cat coding on a laptop?',
      role: 'user',
      type: 'text'
    },
    {
      id: '6',
      content: 'I\'d be happy to generate that image for you! Here\'s a cute cat coding on a laptop:',
      role: 'assistant',
      type: 'image'
    }
  ]);

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
                    {message.content}
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
          <div className="relative rounded-3xl border border-gray-300 bg-white focus-within:border-gray-400">
            {/* Textarea */}
            <textarea
              placeholder={mode === 'text' ? 'Message ChatGPT' : 'Describe the image you want to generate...'}
              className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-gray-900 placeholder-gray-500 focus:outline-none min-h-[44px] max-h-32 overflow-y-auto"
              rows={1}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
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
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-400 hover:bg-gray-600 hover:text-white transition-colors">
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
              </button>
            </div>
          </div>
          
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
