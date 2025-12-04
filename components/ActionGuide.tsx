import React from 'react';
import { X, Factory, Database, User, Settings, Play, PlusCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface ActionGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActionGuide: React.FC<ActionGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-indigo-600 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="text-xl">🚀</span> Quick Start Guide
          </h2>
          <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          <section>
            <h3 className="text-md font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Factory size={18} className="text-blue-500" /> 1. Produce Messages
            </h3>
            <p className="text-sm text-slate-600 mb-2">
              Producers send data to topics. Use the dropdown to select a topic and click "Send Event".
            </p>
          </section>

          <section>
            <h3 className="text-md font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Database size={18} className="text-green-500" /> 2. Manage Topics & Partitions
            </h3>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-sm text-slate-600 space-y-2">
              <p>
                <strong>Partitions:</strong> Topics are split into partitions. Messages are distributed randomly here.
              </p>
              <div className="flex items-start gap-2">
                <Settings size={14} className="mt-1 text-slate-500" />
                <span>
                  <strong>Configuration:</strong> Hover over a partition and click the <Settings size={12} className="inline" /> icon to change the <strong>Max Messages</strong> limit. Watch what happens when it fills up! (Oldest messages get deleted).
                </span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-md font-bold text-slate-800 mb-3 flex items-center gap-2">
              <User size={18} className="text-orange-500" /> 3. Consumers & Groups
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-orange-50 p-3 rounded border border-orange-100">
                <h4 className="font-bold text-orange-800 text-xs uppercase mb-1">Consumer Basics</h4>
                <p className="text-xs text-orange-900">
                  Select a topic to subscribe. Click <Play size={10} className="inline" /> to auto-consume or <strong>+1</strong> to fetch manually.
                </p>
              </div>
              <div className="bg-indigo-50 p-3 rounded border border-indigo-100">
                <h4 className="font-bold text-indigo-800 text-xs uppercase mb-1">Scaling with Groups</h4>
                <p className="text-xs text-indigo-900">
                  Create multiple consumers with the <strong>same Group ID</strong>. They will share the work! If one reads a message, the others won't see it (Load Balancing).
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <Button onClick={onClose}>Got it!</Button>
        </div>
      </div>
    </div>
  );
};