
export const MAX_PARTITIONS = 3;
export const MAX_MESSAGES_PER_PARTITION = 5;

export const INITIAL_TOPICS = [
  {
    id: 'topic-1',
    name: 'orders',
    partitions: [
      { id: 0, messages: [], nextOffset: 0 },
      { id: 1, messages: [], nextOffset: 0 },
    ],
  },
];

export const INITIAL_PRODUCERS = [
  { id: 'prod-1', name: 'Order Service' },
];

export const INITIAL_CONSUMERS = [
  { id: 'cons-1', name: 'Email Sender', groupId: 'group-email', subscribedTopicId: 'topic-1' },
];
