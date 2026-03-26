/**
 * 念头空间 — 气泡漂浮区域
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useThoughtStore } from '../store';
import ThoughtBubble from './ThoughtBubble';

export default function ThoughtSpace() {
  const thoughts = useThoughtStore(s => s.thoughts);
  const activeThoughts = thoughts.filter(t => t.status === 'active');

  return (
    <div className="flex-1 relative overflow-y-auto overflow-x-hidden px-4 py-6">
      {activeThoughts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col items-center gap-4 pb-4">
          <AnimatePresence mode="popLayout">
            {activeThoughts.map((thought, index) => (
              <ThoughtBubble key={thought.uid} thought={thought} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <motion.div
        animate={{
          y: [0, -15, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="text-6xl"
      >
        🫧
      </motion.div>
      <div className="text-center space-y-2">
        <p className="text-lg font-light" style={{ color: 'rgba(200,200,230,0.5)' }}>
          此刻脑海里，有什么声音？
        </p>
        <p className="text-xs" style={{ color: 'rgba(200,200,230,0.25)' }}>
          写下来，让念头从脑内飘到眼前
        </p>
      </div>
    </div>
  );
}
