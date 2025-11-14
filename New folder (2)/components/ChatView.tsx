import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { SendIcon } from './icons';

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { author: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const geminiMessage: ChatMessage = { author: 'gemini', text: '' };
    setMessages((prev) => [...prev, geminiMessage]);

    try {
      let fullResponse = '';
      for await (const chunk of generateChatResponse(input)) {
        fullResponse += chunk;
        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1 ? { ...msg, text: fullResponse } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1
            ? { ...msg, text: 'Sorry, something went wrong.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto animate-fade-in">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.author === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                message.author === 'user'
                  ? 'bg-cyan-500/80 rounded-br-none'
                  : 'bg-white/20 backdrop-blur-sm rounded-bl-none'
              }`}
            >
              <p className="text-white whitespace-pre-wrap">{message.text || '...'}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex items-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-full p-2 shadow-inner">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Gemini anything..."
            className="flex-1 bg-transparent px-4 py-2 text-white placeholder-gray-400 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-600 text-white disabled:opacity-50 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Send message"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};
