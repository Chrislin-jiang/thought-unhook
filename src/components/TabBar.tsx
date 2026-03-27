/**
 * 底部 Tab 导航栏 — emoji + 文字
 */

import { motion } from 'framer-motion';
import { useThoughtStore } from '../store';

const TABS = [
  { id: 'space' as const, emoji: '🫧', label: '念头空间' },
  { id: 'journal' as const, emoji: '📊', label: '觉察日志' },
  { id: 'lab' as const, emoji: '🧪', label: '解钩实验室' },
  { id: 'night' as const, emoji: '🌙', label: '睡前模式' },
];

export default function TabBar() {
  const currentPage = useThoughtStore(s => s.currentPage);
  const setPage = useThoughtStore(s => s.setPage);

  return (
    <div
      className="relative z-20 flex items-center justify-around px-4 py-2"
      style={{
        background: 'rgba(8,8,15,0.95)',
        borderTop: '1px solid rgba(200,200,230,0.04)',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      }}
    >
      {TABS.map(tab => {
        const isActive = currentPage === tab.id;
        return (
          <motion.button
            key={tab.id}
            onClick={() => setPage(tab.id)}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl relative"
            whileTap={{ scale: 0.92 }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <span
              className="text-lg"
              style={{ opacity: isActive ? 1 : 0.35 }}
            >
              {tab.emoji}
            </span>
            <span
              className="text-[10px]"
              style={{
                color: isActive
                  ? 'rgba(139,124,247,0.9)'
                  : 'rgba(200,200,230,0.3)',
              }}
            >
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute -top-1 w-6 h-0.5 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, rgba(139,124,247,0.7), rgba(108,180,238,0.5))',
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
