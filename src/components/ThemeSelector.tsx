/**
 * 主题选择器 — 星空蓝紫色调
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

  const themes: ThemeType[] = ['cosmos', 'starry', 'ocean', 'forest', 'void'];

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  return (
    <div className="relative">
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.92 }}
        className="flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono"
        style={{
          background: 'rgba(0,240,255,0.04)',
          border: '1px solid rgba(0,240,255,0.12)',
          color: 'rgba(0,240,255,0.5)',
          fontSize: '11px',
          cursor: 'pointer',
          fontFamily: "'JetBrains Mono', monospace",
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                onClick={() => setIsOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'fixed',
                  top: menuPos.top,
                  right: menuPos.right,
                  zIndex: 9999,
                  padding: '8px',
                  borderRadius: '14px',
                  background: 'rgba(12,12,22,0.98)',
                  border: '1px solid rgba(200,200,230,0.08)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  minWidth: '170px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                }}
              >
                <p
                  className="text-[10px] px-2 py-1 mb-1"
                  style={{ color: 'rgba(200,200,230,0.3)' }}
                >
                  选择主题背景
                </p>
                {themes.map(theme => {
                  const info = THEME_INFO[theme];
                  const isActive = currentTheme === theme;
                  return (
                    <motion.button
                      key={theme}
                      onClick={() => {
                        setTheme(theme);
                        setIsOpen(false);
                      }}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left"
                      style={{
                        background: isActive ? 'rgba(139,124,247,0.1)' : 'transparent',
                        border: 'none',
                        color: isActive ? 'rgba(210,210,235,0.9)' : 'rgba(200,200,230,0.5)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span className="text-base" style={{ opacity: isActive ? 1 : 0.6 }}>{info.emoji}</span>
                      <div>
                        <div className="text-sm">{info.name}</div>
                        <div
                          className="text-[10px]"
                          style={{ color: 'rgba(200,200,230,0.3)' }}
                        >
                          {info.description}
                        </div>
                      </div>
                      {isActive && (
                        <span className="ml-auto text-xs" style={{ color: 'rgba(139,124,247,0.7)' }}>✓</span>
                      )}
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
