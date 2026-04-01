/**
 * 底部 Tab — 柔和治愈风
 */

import { motion } from 'framer-motion';
import { useThoughtStore } from '../store';

const TABS = [
  { id: 'space' as const, emoji: '🎭', activeEmoji: '🎭', label: '剧场' },
  { id: 'journal' as const, emoji: '📊', activeEmoji: '📊', label: '记录' },
  { id: 'lab' as const, emoji: '🧪', activeEmoji: '🧪', label: '练习' },
  { id: 'night' as const, emoji: '🌙', activeEmoji: '🌙', label: '散场' },
];

export default function TabBar() {
  const currentPage = useThoughtStore(s => s.currentPage);
  const setPage = useThoughtStore(s => s.setPage);

  return (
    <div
      className="relative z-20 flex items-center justify-around px-4 py-1.5"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(139,124,247,0.08)',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      }}
    >
      {TABS.map(tab => {
        const isActive = currentPage === tab.id;
        return (
          <motion.button
            key={tab.id}
            onClick={() => setPage(tab.id)}
            className="flex flex-col items-center gap-0.5 px-5 py-1.5 relative rounded-2xl"
            whileTap={{ scale: 0.9 }}
            style={{
              background: isActive ? 'rgba(139,124,247,0.1)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.3s ease',
            }}
          >
            <motion.span
              className="text-xl"
              animate={isActive ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.3 }}
              style={{
                filter: isActive ? 'none' : 'grayscale(0.5)',
                opacity: isActive ? 1 : 0.5,
              }}
            >
              {isActive ? tab.activeEmoji : tab.emoji}
            </motion.span>
            <span
              className="text-[10px] font-medium"
              style={{
                color: isActive ? '#8B7CF7' : 'rgba(45,43,85,0.35)',
                transition: 'color 0.3s ease',
              }}
            >
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
