
export const MAX_PARTITIONS = 3;
export const MAX_MESSAGES_PER_PARTITION = 5;

export const INITIAL_BROKERS = [
  { id: 1, name: 'broker-1', host: 'localhost', port: 9092, isAlive: true },
  { id: 2, name: 'broker-2', host: 'localhost', port: 9093, isAlive: true },
  { id: 3, name: 'broker-3', host: 'localhost', port: 9094, isAlive: true },
];

export const INITIAL_TOPICS = [
  {
    id: 'topic-1',
    name: 'orders',
    partitions: [
      { id: 0, messages: [], nextOffset: 0, leaderBrokerId: 1, replicaBrokerIds: [1, 2] },
      { id: 1, messages: [], nextOffset: 0, leaderBrokerId: 2, replicaBrokerIds: [2, 3] },
    ],
  },
];

export const INITIAL_PRODUCERS = [
  { id: 'prod-1', name: 'Order Service' },
];

export const INITIAL_CONSUMERS = [
  { id: 'cons-1', name: 'Email Sender', groupId: 'group-email', subscribedTopicId: 'topic-1' },
];
