/**
 * 主题选择器 — 柔和治愈风
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThoughtStore } from '../store';
import { THEME_INFO } from '../types';
import type { ThemeType } from '../types';

export default function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const currentTheme = useThoughtStore(s => s.currentTheme);
  const setTheme = useThoughtStore(s => s.setTheme);
  const currentInfo = THEME_INFO[currentTheme];

  const themes: ThemeType[] = ['cosmos', 'starry', 'ocean', 'forest', 'void', 'theater'];

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  }, []);

  useEffect(() => {
    if (isOpen) updatePosition();
  }, [isOpen, updatePosition]);

  return (
    <div className="relative">
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.92 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
        style={{
          background: 'rgba(139,124,247,0.08)',
          border: '1.5px solid rgba(139,124,247,0.12)',
          color: '#8B7CF7',
          cursor: 'pointer',
        }}
      >
        <span>{currentInfo.emoji}</span>
        <span>{currentInfo.name}</span>
      </motion.button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999,
                  padding: '8px', borderRadius: '20px',
                  background: 'rgba(255,255,255,0.95)',
                  border: '1.5px solid rgba(139,124,247,0.1)',
                  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                  minWidth: '180px',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(139,124,247,0.06)',
                }}
              >
                <p className="text-[10px] px-3 py-1.5 mb-1" style={{ color: 'var(--text-hint)' }}>
                  选择主题
                </p>
                {themes.map(theme => {
                  const info = THEME_INFO[theme];
                  const isActive = currentTheme === theme;
                  return (
                    <motion.button
                      key={theme}
                      onClick={() => { setTheme(theme); setIsOpen(false); }}
                      whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left"
                      style={{
                        background: isActive ? 'rgba(139,124,247,0.1)' : 'transparent',
                        border: 'none',
                        color: isActive ? '#8B7CF7' : 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span className="text-lg" style={{ opacity: isActive ? 1 : 0.7 }}>{info.emoji}</span>
                      <div>
                        <div className="text-sm font-medium">{info.name}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-hint)' }}>{info.description}</div>
                      </div>
                      {isActive && <span className="ml-auto text-xs">✓</span>}
                    </motion.button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
