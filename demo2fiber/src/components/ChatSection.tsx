import React, { useState } from 'react';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isUser: boolean;
}

const ChatSection: React.FC = () => {
  const [messages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project's success.\n\nPlease come prepared with any questions or insights you may have. Looking forward to",
      timestamp: '10:30 AM',
      isUser: false
    },
    {
      id: '2',
      text: "Hi, let's have a meeting tomorrow to discuss the project...",
      timestamp: '10:35 AM',
      isUser: false
    }
  ]);

  const [inputValue, setInputValue] = useState('');

  return (
    <div className="flex flex-col h-full justify-between px-2">
      <div className="flex flex-col gap-6 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="flex gap-2">
            {/* Avatar */}
            <div className="w-6 h-6 rounded-full bg-neutral-100 overflow-hidden flex-shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
            </div>
            
            {/* Message Content */}
            <div className="flex-1 bg-white rounded-lg p-4 shadow-md border border-neutral-200">
              <p className="text-xs text-neutral-500 leading-4 whitespace-pre-wrap">
                {message.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="mt-4">
        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Placeholder"
            className="w-full min-h-[60px] p-3 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatSection;