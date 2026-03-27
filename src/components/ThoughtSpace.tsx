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
    <div className="flex-1 relative overflow-y-auto overflow-x-hidden px-5 py-4">
      {activeThoughts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col items-center gap-5 pb-4">
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
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <motion.div
        animate={{
          y: [0, -10, 0],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className=""
        style={{ fontSize: '48px', color: 'rgba(139,124,247,0.18)', fontWeight: 300 }}
      >
        念
      </motion.div>
      <div className="text-center space-y-3">
        <p className="text-sm font-light tracking-wider" style={{ color: 'rgba(200,200,230,0.35)' }}>
          此刻脑海里，有什么声音？
        </p>
        <p className="text-[11px] tracking-widest" style={{ color: 'rgba(200,200,230,0.15)', letterSpacing: '0.15em' }}>
          写下来，让念头从脑内飘到眼前
        </p>
      </div>
    </div>
  );
}
