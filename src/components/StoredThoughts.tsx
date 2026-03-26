/**
 * 暂存念头列表 — 念头罐
 */

import { motion } from 'framer-motion';
import { useThoughtStore } from '../store';
import { EMOTION_COLORS, PERSONA_INFO } from '../types';

export default function StoredThoughts() {
  const thoughts = useThoughtStore(s => s.thoughts);
  const storedThoughts = thoughts.filter(t => t.status === 'stored');
  const releaseThought = useThoughtStore(s => s.releaseThought);

  if (storedThoughts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="relative z-10 px-4 pb-3 max-h-48 overflow-y-auto"
    >
      <div className="space-y-2">
        {storedThoughts.map(thought => {
          const colors = EMOTION_COLORS[thought.emotion];
          const persona = PERSONA_INFO[thought.persona];
          return (
            <motion.div
              key={thought.uid}
              layout
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,200,100,0.1)',
              }}
            >
              <span className="text-sm">{persona.emoji}</span>
              <p
                className="flex-1 text-xs truncate"
                style={{ color: colors.text }}
              >
                {thought.content}
              </p>
              <button
                onClick={() => releaseThought(thought.uid, 'blow')}
                className="text-xs px-2 py-1 rounded-lg"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(200,200,230,0.5)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                }}
              >
                💨 释放
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
