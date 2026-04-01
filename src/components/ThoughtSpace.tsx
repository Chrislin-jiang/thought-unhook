/**
 * 念头空间 — 柔和治愈风
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useThoughtStore } from '../store';
import ThoughtBubble from './ThoughtBubble';
import type { MouseEvent } from 'react';

export default function ThoughtSpace() {
  const thoughts = useThoughtStore(s => s.thoughts);
  const selectedId = useThoughtStore(s => s.selectedThoughtId);
  const selectThought = useThoughtStore(s => s.selectThought);
  const activeThoughts = thoughts.filter(t => t.status === 'active');

  const handleBackgroundClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget && selectedId) {
      selectThought(null);
    }
  };

  return (
    <div
      className="flex-1 relative overflow-y-auto overflow-x-hidden px-5 py-4"
      onClick={handleBackgroundClick}
    >
      {activeThoughts.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          className="flex flex-col items-center gap-4 pb-4"
          onClick={handleBackgroundClick}
        >
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
    <div className="flex flex-col items-center justify-center h-full gap-4">
      {/* 可爱吉祥物 */}
      <motion.div
        className="mascot-float"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="text-7xl">🎭</div>
      </motion.div>

      <div className="text-center space-y-2">
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-base font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          舞台已准备好
        </motion.p>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          写下脑子里正在上演的台词吧
        </p>
      </div>
    </div>
  );
}
