
export interface Message {
  id: string;
  key?: string; // Optional message key for partitioning
  content: string;
  timestamp: number;
  offset: number;
}

export interface Partition {
  id: number;
  messages: Message[];
  maxMessages?: number;
  nextOffset: number; // Tracks the next unique offset to assign
  leaderBrokerId?: number; // ID of the broker that is the leader for this partition
  replicaBrokerIds?: number[]; // IDs of broker replicas (including leader)
}

export interface Topic {
  id: string;
  name: string;
  partitions: Partition[];
}

export interface Producer {
  id: string;
  name: string;
}

export interface Broker {
  id: number;
  name: string;
  host: string;
  port: number;
  isAlive: boolean;
}

export interface Consumer {
  id: string;
  name: string;
  groupId: string;
  subscribedTopicId: string | null;
  lastConsumedMessage?: string;
  lastConsumedOffset?: number;
}

export enum EntityType {
  PRODUCER = 'PRODUCER',
  TOPIC = 'TOPIC',
  CONSUMER = 'CONSUMER',
  BROKER = 'BROKER',
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  text: string;
  type: 'info' | 'success' | 'error';
}
