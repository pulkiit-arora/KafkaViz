import React, { useState, useCallback } from 'react';
import { 
  PlusCircle, 
  RotateCcw, 
  HelpCircle,
  Layout,
  BookOpen
} from 'lucide-react';
import { 
  Topic, 
  Producer, 
  Consumer, 
  LogEntry, 
  Message,
  Partition
} from './types';
import { 
  INITIAL_TOPICS, 
  INITIAL_PRODUCERS, 
  INITIAL_CONSUMERS, 
  MAX_MESSAGES_PER_PARTITION 
} from './constants';
import { ProducerNode } from './components/Visualizer/ProducerNode';
import { TopicNode } from './components/Visualizer/TopicNode';
import { ConsumerNode } from './components/Visualizer/ConsumerNode';
import { Button } from './components/ui/Button';
import { KafkaTutor } from './components/KafkaTutor';
import { AddConsumerDialog } from './components/AddConsumerDialog';
import { ActionGuide } from './components/ActionGuide';
import { formatMessageLabel } from './utils';

// State to track offsets: GroupID -> TopicID -> PartitionID -> NextOffset
type GroupOffsets = Record<string, Record<string, Record<number, number>>>;

const App: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>(INITIAL_TOPICS);
  const [producers, setProducers] = useState<Producer[]>(INITIAL_PRODUCERS);
  const [consumers, setConsumers] = useState<Consumer[]>(INITIAL_CONSUMERS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [msgCounter, setMsgCounter] = useState<number>(1);
  const [consumerSeq, setConsumerSeq] = useState<number>(1); // For sequential naming
  const [groupOffsets, setGroupOffsets] = useState<GroupOffsets>({});

  // UI States
  const [isConsumerModalOpen, setIsConsumerModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // --- Actions ---

  const addLog = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [{ id: Math.random().toString(), timestamp: new Date(), text, type }, ...prev].slice(0, 20));
  };

  const handleReset = () => {
    setTopics(INITIAL_TOPICS);
    setProducers(INITIAL_PRODUCERS);
    setConsumers(INITIAL_CONSUMERS);
    setMsgCounter(1);
    setConsumerSeq(1);
    setGroupOffsets({});
    setLogs([]);
    addLog("Simulation reset.", 'info');
  };

  const addProducer = () => {
    const id = Math.random().toString(36).substr(2, 5);
    setProducers([...producers, { id, name: `Producer-${id}` }]);
    addLog("Added new Producer", 'info');
  };

  const addTopic = () => {
    const id = Math.random().toString(36).substr(2, 5);
    const newTopic: Topic = {
      id: `topic-${id}`,
      name: `Topic-${id}`,
      partitions: [
        { id: 0, messages: [], nextOffset: 0 },
        { id: 1, messages: [], nextOffset: 0 },
        { id: 2, messages: [], nextOffset: 0 },
      ]
    };
    setTopics([...topics, newTopic]);
    addLog(`Created new Topic: ${newTopic.name}`, 'success');
  };

  const handleAddConsumer = (groupId: string, topicId: string, customName: string) => {
    const id = Math.random().toString(36).substr(2, 5);
    let name = customName.trim();
    
    // If no name provided, generate a sequential one
    if (!name) {
      name = `Consumer-${consumerSeq}`;
      setConsumerSeq(prev => prev + 1);
    }
    
    setConsumers([...consumers, { 
      id, 
      name, 
      groupId, 
      subscribedTopicId: topicId || (topics[0]?.id ?? null) 
    }]);
    addLog(`Added ${name} to Group "${groupId}"`, 'info');
  };

  const handleSubscribe = (consumerId: string, topicId: string) => {
    setConsumers(prev => prev.map(c => {
      if (c.id === consumerId) {
        return { ...c, subscribedTopicId: topicId, lastConsumedMessage: undefined };
      }
      return c;
    }));
    addLog(`Consumer updated subscription to topic`, 'info');
  };

  const handleProduce = useCallback((producerId: string, topicId: string, _content: string) => {
    // Generate content. We use msgCounter for content, but Partitions manage their own Offset ID.
    const content = `Msg-${msgCounter}`;
    setMsgCounter(prev => prev + 1);

    setTopics(prevTopics => {
      const newTopics = [...prevTopics];
      const topicIndex = newTopics.findIndex(t => t.id === topicId);
      if (topicIndex === -1) return prevTopics;

      const topic = newTopics[topicIndex];
      // Round-robin selection
      const partitionIndex = Math.floor(Math.random() * topic.partitions.length);
      const partition = topic.partitions[partitionIndex];

      let currentMessages = [...partition.messages];
      const limit = partition.maxMessages ?? MAX_MESSAGES_PER_PARTITION;
      
      // Simulating Retention Policy: Drop oldest if full
      if (currentMessages.length >= limit) {
         addLog(`Retention: Oldest message expired in ${topic.name} [Part-${partition.id}]`, 'info');
         // Remove oldest (index 0)
         currentMessages = currentMessages.slice(1);
      }

      // Assign Offset based on Partition's counter
      const offset = partition.nextOffset;

      const newMessage: Message = {
        id: Math.random().toString(36),
        content,
        timestamp: Date.now(),
        offset
      };

      const newPartitions = [...topic.partitions];
      newPartitions[partitionIndex] = {
        ...partition,
        messages: [...currentMessages, newMessage],
        nextOffset: offset + 1 // Increment offset counter
      };

      newTopics[topicIndex] = { ...topic, partitions: newPartitions };
      
      addLog(`Produced "${formatMessageLabel(content, offset)}" to ${topic.name} [Part-${partition.id}]`, 'success');
      return newTopics;
    });
  }, [msgCounter]);

  const handleConsume = useCallback((consumerId: string) => {
    const consumer = consumers.find(c => c.id === consumerId);
    if (!consumer || !consumer.subscribedTopicId) return;

    const topicIndex = topics.findIndex(t => t.id === consumer.subscribedTopicId);
    if (topicIndex === -1) return;
    const topic = topics[topicIndex];

    // Determine Consumer Group Progress
    const groupState = groupOffsets[consumer.groupId] || {};
    const topicOffsets = groupState[topic.id] || {};

    let chosenPartition: Partition | null = null;
    let msgToConsume: Message | null = null;

    // Look for a partition with available messages for this Group's Offset
    for (const partition of topic.partitions) {
        const expectedOffset = topicOffsets[partition.id] || 0;
        
        // Find message with the expected offset
        const msg = partition.messages.find(m => m.offset === expectedOffset);

        if (msg) {
            chosenPartition = partition;
            msgToConsume = msg;
            break; 
        } 
        
        // AUTO-OFFSET-RESET logic:
        // If the partition has messages, but they are all newer than our expected offset, 
        // it means retention deleted the ones we wanted. We must skip ahead.
        if (!msg && partition.messages.length > 0) {
            const firstAvailable = partition.messages[0];
            if (firstAvailable.offset > expectedOffset) {
                // We are behind! Fast forward to the first available message.
                chosenPartition = partition;
                msgToConsume = firstAvailable;
                addLog(`Group ${consumer.groupId} offset reset: Skipping to M${firstAvailable.offset} on Part-${partition.id}`, 'error');
                break;
            }
        }
    }
    
    if (!chosenPartition || !msgToConsume) {
      // Nothing to consume (caught up)
      addLog(`${consumer.name} is caught up. No messages available.`, 'info');
      return;
    }

    // 1. Update Group Offsets (Commit Offset)
    // We increment the offset to (consumed + 1)
    const newOffsetValue = msgToConsume.offset + 1;
    
    setGroupOffsets(prev => ({
        ...prev,
        [consumer.groupId]: {
            ...prev[consumer.groupId],
            [topic.id]: {
                ...(prev[consumer.groupId]?.[topic.id] || {}),
                [chosenPartition!.id]: newOffsetValue
            }
        }
    }));

    // 2. Update Consumer (Show Consumed Message)
    // NOTE: We do NOT remove the message from the Topic. It stays until retention deletes it.
    setConsumers(prev => prev.map(c => {
      if (c.id === consumerId) {
        return { 
            ...c, 
            lastConsumedMessage: msgToConsume!.content,
            lastConsumedOffset: msgToConsume!.offset
        };
      }
      return c;
    }));

    addLog(`${consumer.name} consumed "${formatMessageLabel(msgToConsume.content, msgToConsume.offset)}" from [Part-${chosenPartition.id}]`, 'info');
  }, [consumers, topics, groupOffsets]);

  const removeEntity = (type: 'producer' | 'consumer', id: string) => {
    if (type === 'producer') {
      const p = producers.find(x => x.id === id);
      if (p) addLog(`Removed Producer: ${p.name}`, 'info');
      setProducers(prev => prev.filter(x => x.id !== id));
    }
    if (type === 'consumer') {
      const c = consumers.find(x => x.id === id);
      if (c) addLog(`Removed Consumer: ${c.name}`, 'info');
      setConsumers(prev => prev.filter(x => x.id !== id));
    }
  };

  const updatePartitionLimit = (topicId: string, partitionId: number, newLimit: number) => {
     setTopics(prev => prev.map(t => {
       if (t.id !== topicId) return t;
       return {
         ...t,
         partitions: t.partitions.map(p => {
           if (p.id !== partitionId) return p;
           return { ...p, maxMessages: newLimit };
         })
       };
     }));
     addLog(`Updated partition limit for ${topicId} / Part-${partitionId} to ${newLimit}`, 'info');
  };

  // --- Helpers ---
  const getUniqueGroups = () => Array.from(new Set(consumers.map(c => c.groupId)));

  // --- Context Generator for Gemini ---
  const getSimulationContext = () => {
    return JSON.stringify({
      producers: producers.map(p => p.name),
      topics: topics.map(t => ({ 
        name: t.name, 
        partitions: t.partitions.map(p => ({
            id: p.id,
            msgCount: p.messages.length,
            limit: p.maxMessages ?? MAX_MESSAGES_PER_PARTITION
        }))
      })),
      consumers: consumers.map(c => ({ 
        name: c.name, 
        group: c.groupId, 
        subscription: topics.find(t => t.id === c.subscribedTopicId)?.name,
        offset: c.lastConsumedOffset
      })),
      groupOffsets: groupOffsets
    }, null, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-40 border-b border-slate-700">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Layout className="text-blue-400" size={28} />
            <div>
              <h1 className="text-xl font-bold tracking-tight">KafkaViz</h1>
              <p className="text-xs text-slate-400">Interactive Apache Kafka Learning Playground</p>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="ghost" size="sm" onClick={() => setIsGuideOpen(true)} className="text-blue-300 hover:text-white hover:bg-slate-800 gap-2">
               <BookOpen size={16} /> Guide
             </Button>
             <Button variant="secondary" size="sm" onClick={handleReset} className="gap-2">
               <RotateCcw size={16} /> Reset
             </Button>
             <a href="https://kafka.apache.org/intro" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1 text-sm ml-2">
                <HelpCircle size={16} /> Docs
             </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-8 overflow-hidden flex flex-col md:flex-row gap-8">
        
        {/* Left: Producers */}
        <section className="w-full md:w-1/4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-700">Producers</h2>
            <Button size="sm" onClick={addProducer} title="Add Producer"><PlusCircle size={16} /></Button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 pb-20">
            {producers.length === 0 && <p className="text-sm text-slate-400 italic">No producers active.</p>}
            {producers.map(p => (
              <ProducerNode 
                key={p.id} 
                producer={p} 
                topics={topics} 
                onProduce={handleProduce}
                onRemove={(id) => removeEntity('producer', id)}
              />
            ))}
          </div>
        </section>

        {/* Center: Cluster/Topics */}
        <section className="w-full md:w-2/4 flex flex-col">
           <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-700">Kafka Cluster (Brokers)</h2>
            <Button size="sm" onClick={addTopic} title="Add Topic"><PlusCircle size={16} /></Button>
          </div>
          <div className="flex-1 bg-slate-200/50 rounded-xl border-2 border-dashed border-slate-300 p-4 overflow-y-auto pb-20 relative">
             <div className="absolute top-2 right-2 text-slate-300 font-bold text-5xl opacity-20 pointer-events-none">
                CLUSTER
             </div>
             {topics.length === 0 && (
               <div className="h-full flex items-center justify-center text-slate-400">
                 No topics created.
               </div>
             )}
             {topics.map(t => (
               <TopicNode 
                 key={t.id} 
                 topic={t} 
                 onUpdatePartitionLimit={updatePartitionLimit}
               />
             ))}
          </div>
        </section>

        {/* Right: Consumers */}
        <section className="w-full md:w-1/4 flex flex-col">
           <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-700">Consumers</h2>
            <Button size="sm" onClick={() => setIsConsumerModalOpen(true)} title="Add Consumer"><PlusCircle size={16} /></Button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 pb-20">
            {consumers.length === 0 && <p className="text-sm text-slate-400 italic">No consumers active.</p>}
             {consumers.map(c => (
              <ConsumerNode 
                key={c.id} 
                consumer={c} 
                topics={topics} 
                onConsume={handleConsume}
                onSubscribe={handleSubscribe}
                onRemove={(id) => removeEntity('consumer', id)}
              />
            ))}
          </div>
        </section>

      </main>

      {/* Logs Footer */}
      <footer className="bg-white border-t border-slate-200 h-48 overflow-hidden flex flex-col">
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-500 uppercase tracking-wider">
          Event Log
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-sm">
           {logs.length === 0 && <span className="text-slate-400">Waiting for events...</span>}
           {logs.map(log => (
             <div key={log.id} className={`flex gap-3 ${log.type === 'error' ? 'text-red-600' : log.type === 'success' ? 'text-green-600' : 'text-slate-600'}`}>
                <span className="text-slate-400 select-none">[{log.timestamp.toLocaleTimeString()}]</span>
                <span>{log.text}</span>
             </div>
           ))}
        </div>
      </footer>

      {/* Overlays */}
      <AddConsumerDialog 
        isOpen={isConsumerModalOpen}
        onClose={() => setIsConsumerModalOpen(false)}
        onAdd={handleAddConsumer}
        existingGroups={getUniqueGroups()}
        topics={topics}
      />
      
      <ActionGuide 
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* AI Tutor Integration */}
      <KafkaTutor simulationContext={getSimulationContext()} />
    </div>
  );
};

export default App;