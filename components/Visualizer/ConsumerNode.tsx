import React, { useEffect, useState } from 'react';
import { User, Play, Pause, Trash2, ArrowDownCircle } from 'lucide-react';
import { Consumer, Topic } from '../../types';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMessageLabel } from '../../utils';

interface ConsumerNodeProps {
  consumer: Consumer;
  topics: Topic[];
  onConsume: (consumerId: string) => void;
  onSubscribe: (consumerId: string, topicId: string) => void;
  onRemove: (id: string) => void;
}

export const ConsumerNode: React.FC<ConsumerNodeProps> = ({ 
  consumer, 
  topics, 
  onConsume, 
  onSubscribe, 
  onRemove 
}) => {
  const [isAutoConsuming, setIsAutoConsuming] = useState(false);

  // Auto-consume effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoConsuming) {
      interval = setInterval(() => {
        onConsume(consumer.id);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAutoConsuming, consumer.id, onConsume]);

  return (
    <div className="bg-white border-l-4 border-orange-500 shadow-md rounded-r-lg p-3 w-full mb-2 relative group text-sm">
      <button 
        onClick={() => onRemove(consumer.id)}
        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
        title="Remove Consumer"
      >
        <Trash2 size={14} />
      </button>

      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-orange-100 rounded-full text-orange-600">
          <User size={16} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm">{consumer.name}</h4>
        </div>
      </div>

      <div className="mb-2 space-y-1">
        <label className="text-[9px] uppercase font-bold text-slate-500">Subscribed Topic</label>
        <select 
          className="w-full text-xs border-slate-200 rounded-md p-1 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-orange-500 focus:outline-none"
          value={consumer.subscribedTopicId || ''}
          onChange={(e) => onSubscribe(consumer.id, e.target.value)}
        >
          {topics.length === 0 && <option value="">No Topics</option>}
          {topics.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Consumed Message Display */}
      <div className="mb-2 h-8 relative">
        <AnimatePresence mode='wait'>
          {consumer.lastConsumedMessage ? (
            <motion.div 
              key={`${consumer.lastConsumedMessage}-${consumer.lastConsumedOffset}`} // Unique key triggers animation
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 bg-green-50 border border-green-200 rounded flex items-center justify-between px-2"
            >
              <div className="flex items-center gap-1">
                 <ArrowDownCircle size={12} className="text-green-600" />
                 <span className="text-[10px] font-mono font-bold text-green-700">
                   {formatMessageLabel(consumer.lastConsumedMessage, consumer.lastConsumedOffset)}
                 </span>
              </div>
              <span className="text-[8px] text-green-500 font-bold uppercase tracking-wider">OK</span>
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[9px] text-slate-400 italic bg-slate-50 rounded border border-dashed border-slate-200">
              Waiting for data...
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-1">
        <Button 
          variant={isAutoConsuming ? "secondary" : "primary"}
          size="sm" 
          className="flex-1 gap-0.5 text-xs"
          onClick={() => setIsAutoConsuming(!isAutoConsuming)}
          disabled={!consumer.subscribedTopicId}
        >
          {isAutoConsuming ? <Pause size={12} /> : <Play size={12} />}
          {isAutoConsuming ? 'Pause' : 'Start'}
        </Button>
        <Button 
          variant="secondary"
          size="sm"
          className="text-xs"
          onClick={() => onConsume(consumer.id)}
          title={isAutoConsuming ? "Pause auto-consume to use manual" : "Consume one message"}
          disabled={!consumer.subscribedTopicId || isAutoConsuming}
        >
          +1
        </Button>
      </div>
    </div>
  );
};