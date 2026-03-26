/**
 * 底部 Tab 导航栏
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
  const currentTheme = useThoughtStore(s => s.currentTheme);
  const isVoidTheme = currentTheme === 'void';

  return (
    <div
      className="relative z-20 flex items-center justify-around px-4 py-2 border-t"
      style={{
        background: isVoidTheme ? 'rgba(22,18,12,0.95)' : 'rgba(10,10,26,0.95)',
        borderColor: isVoidTheme ? 'rgba(200,170,120,0.08)' : 'rgba(255,255,255,0.06)',
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
            <span className="text-xl" style={{ opacity: isActive ? 1 : 0.4 }}>
              {tab.emoji}
            </span>
            <span
              className="text-[10px]"
              style={{
                color: isActive
                  ? (isVoidTheme ? 'rgba(220,180,100,0.9)' : 'rgba(139,120,255,0.9)')
                  : (isVoidTheme ? 'rgba(200,180,140,0.3)' : 'rgba(200,200,230,0.3)'),
              }}
            >
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute -top-1 w-6 h-0.5 rounded-full"
                style={{
                  background: isVoidTheme
                    ? 'linear-gradient(90deg, rgba(220,180,100,0.8), rgba(200,160,80,0.8))'
                    : 'linear-gradient(90deg, rgba(139,120,255,0.8), rgba(100,180,255,0.8))',
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
