import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { askGeminiTutor } from '../services/geminiService';
import { Button } from './ui/Button';

interface KafkaTutorProps {
  simulationContext: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const KafkaTutor: React.FC<KafkaTutorProps> = ({ simulationContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: "Hi! I'm your Kafka AI Tutor. I can explain any part of this diagram or Kafka concepts in general. Try asking: 'What is a partition?'" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const answer = await askGeminiTutor(userMsg, simulationContext);
    
    setMessages(prev => [...prev, { role: 'assistant', text: answer }]);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 transition-all z-50 animate-bounce hover:animate-none"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col border border-slate-200 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-bold">Kafka Tutor</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
              }`}
            >
               {/* Simple markdown rendering for bold/italic */}
              <div dangerouslySetInnerHTML={{ 
                __html: msg.text
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/\n/g, '<br/>')
              }} />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-3 rounded-lg rounded-bl-none shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <Button size="sm" onClick={handleSend} disabled={isLoading}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
