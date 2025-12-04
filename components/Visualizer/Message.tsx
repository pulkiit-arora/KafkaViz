
import React from 'react';
import { motion } from 'framer-motion';
import { formatMessageLabel } from '../../utils';

interface MessageProps {
  content: string;
  offset: number;
  isNew?: boolean;
}

export const MessageBlock: React.FC<MessageProps> = ({ content, offset, isNew }) => {
  const displayLabel = formatMessageLabel(content, offset);

  return (
    <motion.div
      initial={isNew ? { scale: 0, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      layout
      className="min-w-[2rem] h-8 px-1 bg-indigo-500 rounded flex items-center justify-center text-[10px] text-white font-bold shadow-sm shrink-0 cursor-help whitespace-nowrap overflow-hidden"
      title={`Global ID: ${content}\nKafka Partition Offset: ${offset}`}
    >
      {displayLabel}
    </motion.div>
  );
};
