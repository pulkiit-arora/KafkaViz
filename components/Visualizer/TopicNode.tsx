
import React, { useState } from 'react';
import { Database, ChevronDown, ChevronUp, Settings, Info, AlertCircle, X, Check, User } from 'lucide-react';
import { Topic, Consumer } from '../../types';
import { MessageBlock } from './Message';
import { MAX_MESSAGES_PER_PARTITION } from '../../constants';
import { AnimatePresence, motion } from 'framer-motion';

interface TopicNodeProps {
  topic: Topic;
  onUpdatePartitionLimit?: (topicId: string, partitionId: number, limit: number) => void;
  consumers?: Consumer[];
  partitionAssignments?: Record<string, Record<string, Record<number, string | null>>>;
}

export const TopicNode: React.FC<TopicNodeProps> = ({ topic, onUpdatePartitionLimit, consumers = [], partitionAssignments = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingPartition, setEditingPartition] = useState<{id: number, limit: number} | null>(null);

  const totalMessages = topic.partitions.reduce((acc, p) => acc + p.messages.length, 0);

  // Get assigned consumer for a partition
  const getAssignedConsumer = (partitionId: number) => {
    // Check all consumer groups for assignments to this topic
    for (const groupId in partitionAssignments) {
      const topicAssignments = partitionAssignments[groupId]?.[topic.id];
      if (topicAssignments && topicAssignments[partitionId]) {
        const consumerId = topicAssignments[partitionId];
        return consumers.find(c => c.id === consumerId);
      }
    }
    return null;
  };

  const handleSaveLimit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingPartition && onUpdatePartitionLimit) {
      onUpdatePartitionLimit(topic.id, editingPartition.id, editingPartition.limit);
      setEditingPartition(null);
    }
  };

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className={`
        bg-slate-800 text-slate-100 rounded-lg p-4 mb-6 shadow-xl w-full max-w-md border
        transition-all duration-200 cursor-pointer relative
        ${isExpanded ? 'border-indigo-500 ring-1 ring-indigo-500/50 bg-slate-800' : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/80'}
      `}
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-green-400" />
          <div className="flex flex-col">
            <span className="font-mono font-bold text-green-400 text-lg leading-none">{topic.name}</span>
            <span className="text-[10px] text-slate-500 font-medium">TOPIC</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded-full border border-slate-700">
            {topic.partitions.length} Partitions
          </span>
          {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      <div className="space-y-3">
        {topic.partitions.map((partition) => {
          const limit = partition.maxMessages ?? MAX_MESSAGES_PER_PARTITION;
          const isFull = partition.messages.length >= limit;
          const isEditing = editingPartition?.id === partition.id;
          const assignedConsumer = getAssignedConsumer(partition.id);

          return (
            <div key={partition.id} className="relative group">
               {/* Partition Label */}
               <div className="absolute left-0 top-0 bottom-0 w-20 flex flex-col items-center justify-center border-r border-slate-600 bg-slate-700/50 rounded-l text-xs font-mono text-slate-400 z-10">
                  <span className="text-[8px] uppercase opacity-50">Part</span>
                  <span>{partition.id}</span>
                  {assignedConsumer && (
                    <div className="mt-1 text-center">
                      <User size={10} className="mx-auto text-orange-400" />
                      <span className="text-[8px] text-orange-400 truncate w-16 block" title={assignedConsumer.name}>
                        {assignedConsumer.name}
                      </span>
                    </div>
                  )}
               </div>
               
               {/* Messages Container */}
               <div className={`ml-20 min-h-[3.5rem] rounded-r border p-2 flex items-center gap-1 overflow-x-auto scrollbar-thin transition-colors relative
                 ${isFull ? 'bg-orange-900/20 border-orange-500/30' : 'bg-slate-900/50 border-slate-700 group-hover:bg-slate-900/80'}`}>
                  
                  <AnimatePresence mode='popLayout'>
                    {partition.messages.map((msg) => (
                      <MessageBlock 
                        key={msg.id} 
                        content={msg.content} 
                        offset={msg.offset}
                        isNew={Date.now() - msg.timestamp < 1000} 
                      />
                    ))}
                  </AnimatePresence>
                  
                  {partition.messages.length === 0 && (
                    <span className="text-xs text-slate-600 italic pl-2">No messages</span>
                  )}

                  {/* Settings Icon / Status */}
                  <div className="ml-auto pl-2 flex items-center gap-1">
                     {isFull && (
                        <div className="text-orange-400 animate-pulse" title="Retention Limit Reached">
                          <AlertCircle size={14} />
                        </div>
                     )}
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setEditingPartition({ id: partition.id, limit });
                       }}
                       className="text-slate-500 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-700"
                       title="Configure Partition"
                     >
                       <Settings size={12} />
                     </button>
                  </div>
               </div>

               {/* Edit Popover */}
               {isEditing && (
                 <div 
                   className="absolute z-20 top-full right-0 mt-1 bg-white p-2 rounded shadow-xl border border-slate-300 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200"
                   onClick={(e) => e.stopPropagation()} 
                 >
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Max Msgs</label>
                      <input 
                        type="number" 
                        min="1"
                        max="20"
                        className="w-12 h-6 text-sm border border-slate-300 rounded px-1 text-slate-900"
                        value={editingPartition.limit}
                        onChange={(e) => setEditingPartition({ ...editingPartition, limit: parseInt(e.target.value) || 1 })}
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-1 mt-auto h-full items-end pb-0.5">
                      <button 
                        onClick={handleSaveLimit}
                        className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        title="Save"
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingPartition(null); }}
                        className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                 </div>
               )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                  <span className="text-xs text-slate-500 block mb-1 uppercase tracking-wider">Total Messages</span>
                  <span className="text-lg font-mono text-indigo-400">{totalMessages}</span>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                  <span className="text-xs text-slate-500 block mb-1 uppercase tracking-wider">Replication Factor</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono text-indigo-400">3</span>
                    <span className="text-[10px] text-slate-500">(Simulated)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-400 bg-blue-900/20 p-3 rounded border border-blue-900/30">
                <Info size={14} className="shrink-0 mt-0.5 text-blue-400" />
                <p>
                  <strong className="text-blue-300">What is Retention?</strong>
                  <br/>
                  Kafka stores messages for a set period. In this simulation, you can set the <strong>limit per partition</strong> using the <Settings size={10} className="inline" /> icon.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
