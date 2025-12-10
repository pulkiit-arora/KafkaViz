import React, { useState } from 'react';
import { Factory, Send, Trash2 } from 'lucide-react';
import { Producer, Topic } from '../../types';
import { Button } from '../ui/Button';

interface ProducerNodeProps {
  producer: Producer;
  topics: Topic[];
  onProduce: (producerId: string, topicId: string, message: string, key?: string) => void;
  onRemove: (id: string) => void;
}

export const ProducerNode: React.FC<ProducerNodeProps> = ({ producer, topics, onProduce, onRemove }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(topics[0]?.id || '');
  const [messageKey, setMessageKey] = useState<string>('');

  const handleProduce = () => {
    if (!selectedTopic) return;
    const msg = `Msg-${Math.floor(Math.random() * 1000)}`;
    onProduce(producer.id, selectedTopic, msg, messageKey || undefined);
  };

  return (
    <div className="bg-white border-l-4 border-blue-500 shadow-md rounded-r-lg p-4 w-64 mb-4 relative group">
      <button 
        onClick={() => onRemove(producer.id)}
        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
        title="Remove Producer"
      >
        <Trash2 size={14} />
      </button>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-blue-100 rounded-full text-blue-600">
          <Factory size={20} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800">{producer.name}</h4>
          <p className="text-xs text-slate-500">Source System</p>
        </div>
      </div>

      <div className="space-y-2">
        <select 
          className="w-full text-sm border-slate-200 rounded-md p-1.5 bg-slate-50"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          {topics.length === 0 && <option>No Topics Available</option>}
          {topics.map(t => <option key={t.id} value={t.id}>Topic: {t.name}</option>)}
        </select>

        <input 
          type="text"
          placeholder="Message Key (optional - controls partition)"
          className="w-full text-sm border-slate-200 rounded-md p-1.5 bg-slate-50"
          value={messageKey}
          onChange={(e) => setMessageKey(e.target.value)}
        />

        <Button 
          variant="primary" 
          size="sm" 
          className="w-full gap-2"
          onClick={handleProduce}
          disabled={topics.length === 0}
        >
          <Send size={14} /> Send Event
        </Button>
      </div>
    </div>
  );
};