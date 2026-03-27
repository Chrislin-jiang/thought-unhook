/**
 * 底部 Tab — 赛博科技风
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
        background: 'rgba(5,5,16,0.96)',
        borderTop: '1px solid rgba(0,240,255,0.06)',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      }}
    >
      {/* 顶部扫描线 */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.15), rgba(255,45,138,0.1), transparent)',
        }}
      />

      {TABS.map(tab => {
        const isActive = currentPage === tab.id;
        return (
          <motion.button
            key={tab.id}
            onClick={() => setPage(tab.id)}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 relative"
            whileTap={{ scale: 0.92 }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span
              className="text-lg"
              style={{
                opacity: isActive ? 1 : 0.3,
                filter: isActive ? 'drop-shadow(0 0 4px rgba(0,240,255,0.4))' : 'none',
              }}
            >
              {tab.emoji}
            </span>
            <span
              className="text-[10px]"
              style={{
                color: isActive ? 'rgba(0,240,255,0.85)' : 'rgba(200,220,240,0.25)',
                fontFamily: isActive ? "'JetBrains Mono', monospace" : 'inherit',
              }}
            >
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute -top-[1px] w-8 h-[2px]"
                style={{
                  background: '#00f0ff',
                  boxShadow: '0 0 8px rgba(0,240,255,0.6), 0 0 20px rgba(0,240,255,0.2)',
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
