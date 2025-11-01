
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { UserIcon, VjaCoreIcon } from './icons';

interface ChatWindowProps {
  chatHistory: ChatMessage[];
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatHistory, isLoading }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  return (
    <div className="space-y-6">
      {chatHistory.map((message, index) => (
        <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
          {message.role === 'model' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-cyan-500/30">
                <VjaCoreIcon className="w-5 h-5 text-cyan-400" />
            </div>
          )}
          <div className={`max-w-xl p-4 rounded-lg ${message.role === 'user' ? 'bg-cyan-600/20 text-slate-100' : 'bg-slate-800/70 text-slate-300'}`}>
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
           {message.role === 'user' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                <UserIcon className="w-5 h-5 text-slate-300" />
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-cyan-500/30">
                <VjaCoreIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="max-w-xl p-4 rounded-lg bg-slate-800/70">
                <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></span>
                </div>
            </div>
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatWindow;
