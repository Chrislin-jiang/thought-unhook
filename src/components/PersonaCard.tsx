/**
 * 角色卡片组件 — Phase 2.1
 * 展示内在角色的详细信息、自我介绍、昵称管理
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThoughtStore } from '../store';
import { PERSONA_INFO } from '../types';
import type { PersonaType } from '../types';
import { generatePersonaGreeting, generatePersonaGreetingLLM } from '../ai-service';
import { isLLMEnabled } from '../llm-client';

interface PersonaCardProps {
  persona: PersonaType;
  count: number;
  percentage: number;
  expanded?: boolean;
  onClick?: () => void;
}

export default function PersonaCard({ persona, count, percentage, expanded, onClick }: PersonaCardProps) {
  const info = PERSONA_INFO[persona];
  const personaNicknames = useThoughtStore(s => s.personaNicknames);
  const setPersonaNickname = useThoughtStore(s => s.setPersonaNickname);
  const thoughts = useThoughtStore(s => s.thoughts);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');

  const nickname = personaNicknames[persona];
  const displayName = nickname || info.name;
  const recentThoughts = thoughts
    .filter(t => t.persona === persona)
    .slice(0, 3)
    .map(t => t.content);

  // 角色问候语：LLM 优先，失败降级本地
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (!expanded) return;

    let cancelled = false;

    if (isLLMEnabled()) {
      generatePersonaGreetingLLM(persona, count, nickname).then(result => {
        if (!cancelled) setGreeting(result);
      }).catch(() => {
        if (!cancelled) setGreeting(generatePersonaGreeting(persona, count, nickname));
      });
    } else {
      setGreeting(generatePersonaGreeting(persona, count, nickname));
    }

    return () => { cancelled = true; };
  }, [expanded, persona, count, nickname]);

  const handleSaveNickname = () => {
    if (nicknameInput.trim()) {
      setPersonaNickname(persona, nicknameInput.trim());
    }
    setEditingNickname(false);
    setNicknameInput('');
  };

  return (
    <motion.div
      layout
      onClick={onClick}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      whileHover={onClick ? { scale: 1.01 } : {}}
    >
      {/* 卡片头部 */}
      <div className="p-4 flex items-center gap-3">
        <motion.span
          className="text-3xl"
          animate={expanded ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: expanded ? Infinity : 0 }}
        >
          {info.emoji}
        </motion.span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: 'rgba(230,230,250,0.9)' }}>
              {displayName}
            </span>
            {nickname && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{
                background: 'rgba(139,220,180,0.08)',
                color: 'rgba(139,220,180,0.5)',
              }}>
                {info.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px]" style={{ color: 'rgba(200,200,230,0.4)' }}>
              出场 {count} 次
            </span>
            <span className="text-[10px]" style={{ color: 'rgba(139,120,255,0.5)' }}>
              {percentage}%
            </span>
          </div>
        </div>
        {onClick && (
          <span className="text-xs" style={{ color: 'rgba(200,200,230,0.2)' }}>
            {expanded ? '▲' : '▼'}
          </span>
        )}
      </div>

      {/* 展开详情 */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* 角色自我介绍 */}
              <div className="p-3 rounded-xl" style={{
                background: 'rgba(139,120,255,0.05)',
                border: '1px solid rgba(139,120,255,0.1)',
              }}>
                <p className="text-[10px] mb-1" style={{ color: 'rgba(139,120,255,0.5)' }}>
                  💬 角色自我介绍
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(200,200,230,0.6)' }}>
                  {greeting}
                </p>
              </div>

              {/* 描述 */}
              <p className="text-xs" style={{ color: 'rgba(200,200,230,0.4)' }}>
                {info.description}
              </p>

              {/* 最近念头 */}
              {recentThoughts.length > 0 && (
                <div>
                  <p className="text-[10px] mb-1.5" style={{ color: 'rgba(200,200,230,0.3)' }}>
                    最近说的话：
                  </p>
                  <div className="space-y-1">
                    {recentThoughts.map((t, i) => (
                      <p key={i} className="text-[10px] pl-2" style={{
                        color: 'rgba(200,200,230,0.4)',
                        borderLeft: '2px solid rgba(139,120,255,0.15)',
                      }}>
                        "{t.length > 30 ? t.slice(0, 30) + '...' : t}"
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* 昵称编辑 */}
              {editingNickname ? (
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <input
                    value={nicknameInput}
                    onChange={e => setNicknameInput(e.target.value)}
                    placeholder="给它起个名字..."
                    maxLength={10}
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(139,120,255,0.2)',
                      color: 'rgba(230,230,250,0.8)',
                      outline: 'none',
                    }}
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveNickname(); }}
                  />
                  <button onClick={handleSaveNickname}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(139,120,255,0.2)', color: 'rgba(200,200,230,0.8)', border: 'none', cursor: 'pointer' }}>
                    ✓
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setEditingNickname(false); }}
                    className="text-xs px-2 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(200,200,230,0.4)', border: 'none', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingNickname(true); setNicknameInput(nickname || ''); }}
                  className="text-[10px] px-3 py-1.5 rounded-lg w-full text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(200,200,230,0.4)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                >
                  ✏️ {nickname ? '修改昵称' : '给它起个昵称'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
