/**
 * 👿 认识脑内角色 — 输入多个念头，AI识别内在角色阵容
 * Phase 2.1 特别练习：角色卡片 + 自我介绍 + 起昵称
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThoughtStore } from '../../store';
import { classifyThought, identifyPersonas, generatePersonaGreeting, generatePersonaGreetingLLM } from '../../ai-service';
import { isLLMEnabled } from '../../llm-client';
import { PERSONA_INFO } from '../../types';
import type { PersonaType } from '../../types';

export default function MeetPersonas({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<'intro' | 'input' | 'analyzing' | 'reveal' | 'nickname' | 'done'>('intro');
  const [thoughts, setThoughts] = useState<Array<{ content: string; persona: PersonaType }>>([]);
  const [input, setInput] = useState('');
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [editingNickname, setEditingNickname] = useState<PersonaType | null>(null);
  const [nicknameInput, setNicknameInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const addThought = useThoughtStore(s => s.addThought);
  const setPersonaNickname = useThoughtStore(s => s.setPersonaNickname);
  const personaNicknames = useThoughtStore(s => s.personaNicknames);
  const addPracticeRecord = useThoughtStore(s => s.addPracticeRecord);
  const [startTime] = useState(Date.now());

  const handleAddThought = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const classification = classifyThought(trimmed);
    await addThought(trimmed);
    setThoughts(prev => [...prev, { content: trimmed, persona: classification.persona }]);
    setInput('');
    inputRef.current?.focus();
  };

  const handleStartAnalysis = () => {
    setPhase('analyzing');
    // 模拟分析延迟
    setTimeout(() => {
      setPhase('reveal');
      // 开始逐个揭示角色
      revealNextPersona(0);
    }, 2000);
  };

  const personas = identifyPersonas(thoughts).personas;

  const revealNextPersona = (index: number) => {
    if (index >= personas.length) {
      setTimeout(() => setPhase('nickname'), 1500);
      return;
    }
    setRevealedIndex(index);
    setTimeout(() => revealNextPersona(index + 1), 3000);
  };

  const handleSaveNickname = (type: PersonaType) => {
    if (nicknameInput.trim()) {
      setPersonaNickname(type, nicknameInput.trim());
    }
    setEditingNickname(null);
    setNicknameInput('');
  };

  // LLM 优先的问候语，失败降级本地
  const [greetings, setGreetings] = useState<Record<string, string>>({});

  useEffect(() => {
    if ((phase === 'reveal' || phase === 'nickname') && personas.length > 0) {
      let cancelled = false;
      personas.forEach(p => {
        const nickname = personaNicknames[p.type];
        if (isLLMEnabled()) {
          generatePersonaGreetingLLM(p.type, p.frequency, nickname).then(result => {
            if (!cancelled) setGreetings(prev => ({ ...prev, [p.type]: result }));
          }).catch(() => {
            if (!cancelled) setGreetings(prev => ({ ...prev, [p.type]: generatePersonaGreeting(p.type, p.frequency, nickname) }));
          });
        } else {
          setGreetings(prev => ({ ...prev, [p.type]: generatePersonaGreeting(p.type, p.frequency, nickname) }));
        }
      });
      return () => { cancelled = true; };
    }
  }, [phase, personas.length]);

  const getGreeting = (type: PersonaType, frequency: number, nickname?: string) => {
    return greetings[type] || generatePersonaGreeting(type, frequency, nickname);
  };

  const handleComplete = () => {
    addPracticeRecord({
      id: String(Date.now()),
      type: 'meet-personas',
      completedAt: Date.now(),
      duration: Math.round((Date.now() - startTime) / 1000),
      thoughtsUsed: thoughts.map(t => t.content),
    });
    setPhase('done');
  };

  return (
    <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
      {/* 返回按钮 */}
      <div className="px-4 pt-3">
        <button onClick={onBack} className="text-xs px-3 py-1.5 rounded-full" style={{
          background: 'rgba(255,255,255,0.05)', color: 'rgba(200,200,230,0.5)',
          border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
        }}>← 返回实验室</button>
      </div>

      <AnimatePresence mode="wait">
        {/* 引导语 */}
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-8"
          >
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl mb-6">👥</motion.div>
            <h2 className="text-lg font-medium mb-3" style={{ color: 'rgba(230,230,250,0.9)' }}>认识脑内角色</h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-sm text-center mb-2 leading-relaxed" style={{ color: 'rgba(200,200,230,0.6)' }}>
              让我们来认识一下住在你脑子里的小伙伴们
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              className="text-xs text-center mb-8" style={{ color: 'rgba(200,200,230,0.3)' }}>
              输入 3-5 个近期反复出现的念头，AI 会帮你识别它们来自哪些角色
            </motion.p>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              onClick={() => setPhase('input')} className="px-8 py-3 rounded-full text-sm"
              style={{ background: 'linear-gradient(135deg, rgba(139,120,255,0.8), rgba(100,180,255,0.8))', color: '#fff', border: 'none', cursor: 'pointer' }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              开始
            </motion.button>
          </motion.div>
        )}

        {/* 输入阶段 */}
        {phase === 'input' && (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col px-5 py-4 overflow-y-auto"
          >
            <p className="text-center text-sm mb-4" style={{ color: 'rgba(200,200,230,0.5)' }}>
              写下 3-5 个最近反复出现的念头
            </p>

            {thoughts.length > 0 && (
              <div className="space-y-2 mb-4">
                {thoughts.map((t, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-xl text-xs flex items-center gap-2"
                    style={{ background: 'rgba(139,120,255,0.08)', border: '1px solid rgba(139,120,255,0.15)', color: 'rgba(200,200,230,0.7)' }}>
                    <span>{PERSONA_INFO[t.persona].emoji}</span>
                    <span className="flex-1">{t.content}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {thoughts.length < 5 && (
              <div className="relative mb-4">
                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddThought(); } }}
                  placeholder="写下一个念头..." rows={2} maxLength={100} className="w-full"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px', color: 'rgba(230,230,250,0.8)', padding: '12px 16px',
                    fontSize: '14px', lineHeight: 1.5, resize: 'none', outline: 'none', fontFamily: 'inherit' }}
                  autoFocus />
              </div>
            )}

            {thoughts.length >= 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-2">
                <motion.button onClick={handleStartAnalysis} className="px-6 py-2.5 rounded-full text-sm"
                  style={{ background: 'linear-gradient(135deg, rgba(139,120,255,0.8), rgba(100,180,255,0.8))', color: '#fff', border: 'none', cursor: 'pointer' }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  开始分析角色 ✨
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* 分析中 */}
        {phase === 'analyzing' && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-4xl mb-6">🔍</motion.div>
            <p className="text-sm" style={{ color: 'rgba(200,200,230,0.6)' }}>AI 正在分析你的念头...</p>
            <p className="text-xs mt-2" style={{ color: 'rgba(200,200,230,0.3)' }}>识别脑内角色中</p>
          </motion.div>
        )}

        {/* 逐个揭示角色 */}
        {phase === 'reveal' && (
          <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
          >
            <AnimatePresence mode="wait">
              {revealedIndex >= 0 && revealedIndex < personas.length && (
                <motion.div
                  key={revealedIndex}
                  initial={{ opacity: 0, scale: 0.5, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring' }}
                  className="text-center max-w-xs"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: 1 }}
                    className="text-6xl mb-4"
                  >
                    {personas[revealedIndex].emoji}
                  </motion.div>
                  <h3 className="text-xl font-medium mb-2" style={{ color: 'rgba(230,230,250,0.9)' }}>
                    {personas[revealedIndex].name}
                  </h3>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(200,200,230,0.6)' }}>
                    {personas[revealedIndex].greeting}
                  </p>
                  <p className="text-[10px]" style={{ color: 'rgba(200,200,230,0.3)' }}>
                    出场 {personas[revealedIndex].frequency} 次
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 进度 */}
            <div className="flex gap-2 mt-8">
              {personas.map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full" style={{
                  background: i <= revealedIndex ? 'rgba(139,120,255,0.8)' : 'rgba(255,255,255,0.1)',
                }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* 起昵称阶段 */}
        {phase === 'nickname' && (
          <motion.div key="nickname" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto px-5 py-4"
          >
            <p className="text-center text-sm mb-2" style={{ color: 'rgba(200,200,230,0.7)' }}>
              你的脑内角色阵容 👥
            </p>
            <p className="text-center text-xs mb-6" style={{ color: 'rgba(200,200,230,0.3)' }}>
              你可以给每个角色起一个昵称
            </p>

            <div className="space-y-3 mb-6">
              {personas.map((persona, i) => {
                const nickname = personaNicknames[persona.type];
                const isEditing = editingNickname === persona.type;
                return (
                  <motion.div
                    key={persona.type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{persona.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium" style={{ color: 'rgba(230,230,250,0.9)' }}>
                            {nickname || persona.name}
                          </span>
                          {nickname && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                              background: 'rgba(139,220,180,0.1)',
                              color: 'rgba(139,220,180,0.6)',
                            }}>
                              原名: {persona.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs mb-2" style={{ color: 'rgba(200,200,230,0.5)' }}>
                          {getGreeting(persona.type, persona.frequency, nickname)}
                        </p>
                        <p className="text-[10px]" style={{ color: 'rgba(200,200,230,0.3)' }}>
                          出场 {persona.frequency} 次 · 代表念头：{persona.thoughts[0]?.slice(0, 15)}...
                        </p>

                        {/* 昵称编辑 */}
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-2">
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
                              onKeyDown={e => { if (e.key === 'Enter') handleSaveNickname(persona.type); }}
                            />
                            <button
                              onClick={() => handleSaveNickname(persona.type)}
                              className="text-xs px-3 py-1.5 rounded-lg"
                              style={{ background: 'rgba(139,120,255,0.2)', color: 'rgba(200,200,230,0.8)', border: 'none', cursor: 'pointer' }}
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingNickname(persona.type); setNicknameInput(nickname || ''); }}
                            className="text-[10px] mt-2 px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(200,200,230,0.4)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                          >
                            ✏️ {nickname ? '修改昵称' : '起个昵称'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center">
              <motion.button
                onClick={handleComplete}
                className="px-8 py-3 rounded-full text-sm"
                style={{ background: 'linear-gradient(135deg, rgba(139,120,255,0.8), rgba(100,180,255,0.8))', color: '#fff', border: 'none', cursor: 'pointer' }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                完成 ✨
              </motion.button>
              <p className="text-xs mt-3" style={{ color: 'rgba(200,200,230,0.3)' }}>
                下次它们说话时，你可以说——"又是你啊！"
              </p>
            </div>

            <div className="h-4" />
          </motion.div>
        )}

        {/* 完成 */}
        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-5xl mb-6">🎉</motion.div>
            <p className="text-lg text-center mb-2" style={{ color: 'rgba(200,200,230,0.8)' }}>你认识了你的脑内角色</p>
            <p className="text-xs text-center mb-6 leading-relaxed" style={{ color: 'rgba(200,200,230,0.4)' }}>
              现在你知道了——那些声音不是"你"，<br />
              是不同的角色在说话。<br />
              下次它们出现时，跟它们打个招呼吧 👋
            </p>
            <button onClick={onBack} className="px-6 py-2.5 rounded-full text-sm" style={{
              background: 'rgba(255,255,255,0.05)', color: 'rgba(200,200,230,0.5)',
              border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
            }}>返回实验室</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
