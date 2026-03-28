/**
 * Onboarding 引导流程 — Phase 1
 * 
 * 流程：
 * 1. 欢迎页 — "你的脑子里，现在有多嘈杂？"
 * 2. 解释页 — "那些声音不是你"
 * 3. 体验页-捕捉 — 输入一个念头
 * 4. 体验页-AI改写 — 展示改写效果
 * 5. 体验页-释放 — 吹走
 * 6. 体验页-角色 — 介绍角色
 * 7. 完成页
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarryBackground from './StarryBackground';
import { classifyThought, rewriteThought } from '../ai-service';
import { PERSONA_INFO } from '../types';
import { useThoughtStore } from '../store';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [noiseLevel, setNoiseLevel] = useState(5);
  const [inputText, setInputText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [classification, setClassification] = useState<ReturnType<typeof classifyThought> | null>(null);
  const [rewritten, setRewritten] = useState('');
  const [blown, setBlown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const setOnboardingCompleted = useThoughtStore(s => s.setOnboardingCompleted);
  const addThought = useThoughtStore(s => s.addThought);

  const handleInputSubmit = useCallback(() => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setSubmittedText(text);
    const cls = classifyThought(text);
    setClassification(cls);
    const rw = rewriteThought(text);
    setRewritten(rw.variants[0].text);
    setStep(3);
  }, [inputText]);

  const handleBlow = () => {
    setBlown(true);
    setTimeout(() => setStep(5), 1200);
  };

  const handleComplete = async () => {
    // 保存 onboarding 时输入的念头
    if (submittedText) {
      await addThought(submittedText);
    }
    setOnboardingCompleted(true);
  };

  const persona = classification ? PERSONA_INFO[classification.persona] : null;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden" style={{ background: '#0a0a1a', minHeight: '100dvh' }}>
      <StarryBackground />

      <div className="flex-1 flex items-center justify-center relative z-10 px-6">
        <AnimatePresence mode="wait">
          {/* Step 0: 欢迎页 */}
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-sm"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl mb-8"
              >
                🧠
              </motion.div>
              <h1 className="text-xl font-medium mb-4" style={{ color: 'rgba(230,230,250,0.9)' }}>
                你的脑子里，现在有多嘈杂？
              </h1>
              
              {/* 滑动条 */}
              <div className="my-8">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={noiseLevel}
                  onChange={e => setNoiseLevel(Number(e.target.value))}
                  className="w-full accent-purple-400"
                  style={{ accentColor: 'rgba(139,120,255,0.8)' }}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs" style={{ color: 'rgba(200,200,230,0.4)' }}>安静</span>
                  <span className="text-lg" style={{ color: 'rgba(139,120,255,0.8)' }}>{noiseLevel}</span>
                  <span className="text-xs" style={{ color: 'rgba(200,200,230,0.4)' }}>嘈杂</span>
                </div>
              </div>

              <motion.button
                onClick={() => setStep(1)}
                className="px-8 py-3 rounded-full text-sm font-medium"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,120,255,0.8), rgba(100,180,255,0.8))',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                继续
              </motion.button>
            </motion.div>
          )}

          {/* Step 1: 解释页 */}
          {step === 1 && (
            <motion.div
              key="explain"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-sm"
            >
              <div className="space-y-6 mb-10">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg leading-relaxed"
                  style={{ color: 'rgba(230,230,250,0.85)' }}
                >
                  那些声音<strong style={{ color: 'rgba(139,180,255,0.9)' }}>不是你</strong>。
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-lg leading-relaxed"
                  style={{ color: 'rgba(230,230,250,0.7)' }}
                >
                  它们只是路过的念头。
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.7 }}
                  className="text-lg leading-relaxed"
                  style={{ color: 'rgba(230,230,250,0.55)' }}
                >
                  你不需要抓住每一个。
                </motion.p>
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                onClick={() => setStep(2)}
                className="px-8 py-3 rounded-full text-sm font-medium"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,120,255,0.8), rgba(100,180,255,0.8))',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                试一试
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: 体验页-捕捉 */}
          {step === 2 && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm"
            >
              <p className="text-center text-sm mb-6" style={{ color: 'rgba(200,200,230,0.6)' }}>
                试试输入一个现在脑子里的想法
              </p>

              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleInputSubmit();
                    }
                  }}
                  placeholder="比如：我今天什么都没做好..."
                  rows={3}
                  maxLength={200}
                  className="w-full"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    color: '#e0e0f0',
                    padding: '14px 18px',
                    fontSize: '16px',
                    lineHeight: 1.6,
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                  autoFocus
                />
              </div>

              {inputText.trim() && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-6"
                >
                  <motion.button
                    onClick={handleInputSubmit}
                    className="px-8 py-3 rounded-full text-sm font-medium"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,120,255,0.8), rgba(100,180,255,0.8))',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    物化这个念头 🫧
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: 体验页-AI改写 */}
          {step === 3 && (
            <motion.div
              key="rewrite"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm text-center"
            >
              {/* 物化的气泡 */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-2xl p-4 mx-auto mb-6 inline-block"
                style={{
                  background: 'rgba(139,120,255,0.1)',
                  border: '1px solid rgba(139,120,255,0.2)',
                  maxWidth: '300px',
                }}
              >
                <p className="text-sm" style={{ color: 'rgba(230,230,250,0.85)' }}>
                  {submittedText}
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm mb-4"
                style={{ color: 'rgba(200,200,230,0.6)' }}
              >
                看看另一种说法：
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="rounded-2xl p-4 mx-auto mb-6"
                style={{
                  background: 'rgba(139,220,180,0.08)',
                  border: '1px solid rgba(139,220,180,0.15)',
                  maxWidth: '300px',
                }}
              >
                <p className="text-sm" style={{ color: 'rgba(180,220,180,0.9)' }}>
                  {rewritten}
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="text-xs mb-6"
                style={{ color: 'rgba(200,200,230,0.4)' }}
              >
                感觉有什么不同吗？
              </motion.p>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                onClick={() => setStep(4)}
                className="px-8 py-3 rounded-full text-sm font-medium"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,120,255,0.8), rgba(100,180,255,0.8))',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                继续
              </motion.button>
            </motion.div>
          )}

          {/* Step 4: 体验页-释放 */}
          {step === 4 && (
            <motion.div
              key="release"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-sm"
            >
              <p className="text-sm mb-6" style={{ color: 'rgba(200,200,230,0.6)' }}>
                现在，试着把它吹走 💨
              </p>

              <AnimatePresence>
                {!blown && (
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    exit={{ opacity: 0, y: -200, scale: 0, transition: { duration: 1 } }}
                    className="rounded-2xl p-4 mx-auto mb-8 inline-block"
                    style={{
                      background: 'rgba(139,120,255,0.1)',
                      border: '1px solid rgba(139,120,255,0.2)',
                      maxWidth: '300px',
                    }}
                  >
                    <p className="text-sm" style={{ color: 'rgba(230,230,250,0.85)' }}>
                      {rewritten}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!blown ? (
                <motion.button
                  onClick={handleBlow}
                  className="px-10 py-4 rounded-full text-base font-medium"
                  style={{
                    background: 'linear-gradient(135deg, rgba(100,180,255,0.6), rgba(139,220,180,0.6))',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  💨 吹走它
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-lg" style={{ color: 'rgba(139,220,180,0.8)' }}>
                    它飘走了... 🍃
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 5: 体验页-角色 */}
          {step === 5 && persona && (
            <motion.div
              key="persona"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-sm"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-6"
              >
                {persona.emoji}
              </motion.div>
              <p className="text-sm mb-3" style={{ color: 'rgba(200,200,230,0.6)' }}>
                刚才说话的，可能是你脑子里的
              </p>
              <h2 className="text-xl font-medium mb-2" style={{ color: 'rgba(139,180,255,0.9)' }}>
                「{persona.name}」{persona.emoji}
              </h2>
              <p className="text-xs mb-8" style={{ color: 'rgba(200,200,230,0.4)' }}>
                {persona.description}
              </p>
              <p className="text-xs mb-6" style={{ color: 'rgba(200,200,230,0.3)' }}>
                别担心，以后你会越来越认识它们
              </p>

              <motion.button
                onClick={() => setStep(6)}
                className="px-8 py-3 rounded-full text-sm font-medium"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,120,255,0.8), rgba(100,180,255,0.8))',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                继续
              </motion.button>
            </motion.div>
          )}

          {/* Step 5 fallback (no persona) — auto-skip */}
          {step === 5 && !persona && (
            <motion.div
              key="persona-fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onAnimationComplete={() => setStep(6)}
            />
          )}

          {/* Step 6: 完成页 */}
          {step === 6 && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-sm"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-5xl mb-6"
              >
                ✨
              </motion.div>

              <div className="space-y-4 mb-8">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg"
                  style={{ color: 'rgba(230,230,250,0.9)' }}
                >
                  这就是「出戏」——从念头的剧本里，退后一步。
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-sm"
                  style={{ color: 'rgba(200,200,230,0.5)' }}
                >
                  当你需要的时候，随时回来。
                </motion.p>
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={handleComplete}
                className="px-10 py-4 rounded-full text-base font-medium"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,120,255,0.9), rgba(100,180,255,0.9))',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                开始使用 🫧
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 步骤指示器 */}
      <div className="relative z-10 flex justify-center gap-2 pb-8">
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i === step
                ? 'rgba(139,120,255,0.8)'
                : i < step
                  ? 'rgba(139,120,255,0.3)'
                  : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
