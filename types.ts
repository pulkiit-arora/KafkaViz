
export interface Message {
  id: string;
  content: string;
  timestamp: number;
  offset: number;
}

export interface Partition {
  id: number;
  messages: Message[];
  maxMessages?: number;
  nextOffset: number; // Tracks the next unique offset to assign
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
