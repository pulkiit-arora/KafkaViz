import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus } from 'lucide-react';
import { Button } from './ui/Button';
import { Topic, Consumer } from '../types';

interface AddConsumerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (groupId: string, topicId: string, name: string) => void;
  existingGroups: string[];
  topics: Topic[];
}

export const AddConsumerDialog: React.FC<AddConsumerDialogProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  existingGroups, 
  topics 
}) => {
  const [groupId, setGroupId] = useState('group-1');
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(topics[0]?.id || '');
  const [customName, setCustomName] = useState('');

  // Reset/Initialize state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCustomName('');
      if (existingGroups.length > 0) {
        setGroupId(existingGroups[0]);
        setIsNewGroup(false);
      } else {
        setGroupId('group-1');
        setIsNewGroup(true);
      }
      if (topics.length > 0) {
        setSelectedTopic(topics[0].id);
      }
    }
  }, [isOpen, existingGroups, topics]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(groupId, selectedTopic, customName);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 px-4 py-3 flex justify-between items-center">
          <h3 className="text-white font-bold flex items-center gap-2">
            <UserPlus size={18} className="text-orange-400" />
            Add New Consumer
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Consumer Name (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. EmailWorker-1 (Leave blank for auto)"
              className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
            />
          </div>

          {/* Group Selection */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-500 uppercase">Consumer Group</label>
              <button 
                type="button"
                onClick={() => { 
                   if (!isNewGroup) {
                      setGroupId(''); // Clear for typing new
                      setIsNewGroup(true);
                   } else if (existingGroups.length > 0) {
                      setGroupId(existingGroups[0]);
                      setIsNewGroup(false);
                   }
                }}
                className="text-[10px] text-blue-600 hover:underline font-medium"
              >
                {isNewGroup && existingGroups.length > 0 ? "Select Existing" : "Create New Group"}
              </button>
            </div>
            
            {isNewGroup ? (
              <div className="relative">
                <Users size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  required
                  placeholder="Enter Group ID..."
                  className="w-full border border-slate-300 rounded p-2 pl-9 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={groupId}
                  onChange={e => setGroupId(e.target.value)}
                  autoFocus
                />
              </div>
            ) : (
              <select 
                className="w-full border border-slate-300 rounded p-2 text-sm bg-slate-50"
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
              >
                {existingGroups.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            )}
            <p className="text-[10px] text-slate-500 mt-1">
              Consumers in the same group share the workload.
            </p>
          </div>

          {/* Topic Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Initial Topic</label>
            <select 
              className="w-full border border-slate-300 rounded p-2 text-sm bg-slate-50"
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
            >
              {topics.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
              {topics.length === 0 && <option value="">No Topics Created</option>}
            </select>
          </div>

          <div className="pt-2 flex gap-3">
             <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
             <Button type="submit" className="flex-1">Add Consumer</Button>
          </div>

        </form>
      </div>
    </div>
  );
};