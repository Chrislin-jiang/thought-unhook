/**
 * Onboarding 引导流程 — 柔和治愈风
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { classifyThought, rewriteThought, classifyThoughtLLM, rewriteThoughtLLM } from '../ai-service';
import { isLLMEnabled } from '../llm-client';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const setOnboardingCompleted = useThoughtStore(s => s.setOnboardingCompleted);
  const addThought = useThoughtStore(s => s.addThought);

  const handleInputSubmit = useCallback(async () => {
    if (!inputText.trim() || isProcessing) return;
    const text = inputText.trim();
    setSubmittedText(text);
    setIsProcessing(true);

    const localCls = classifyThought(text);
    setClassification(localCls);

    if (isLLMEnabled()) {
      try {
        const [llmCls, llmRw] = await Promise.all([
          classifyThoughtLLM(text).catch(() => null),
          rewriteThoughtLLM(text, localCls.emotion, localCls.cognitiveDistortion).catch(() => null),
        ]);
        if (llmCls) setClassification(llmCls);
        if (llmRw && llmRw.variants.length > 0) { setRewritten(llmRw.variants[0].text); }
        else { setRewritten(rewriteThought(text).variants[0].text); }
      } catch {
        setRewritten(rewriteThought(text).variants[0].text);
      }
    } else {
      setRewritten(rewriteThought(text).variants[0].text);
    }
    setIsProcessing(false);
    setStep(3);
  }, [inputText, isProcessing]);

  const handleBlow = () => { setBlown(true); setTimeout(() => setStep(5), 1200); };

  const handleComplete = async () => {
    if (submittedText) await addThought(submittedText);
    setOnboardingCompleted(true);
  };

  const persona = classification ? PERSONA_INFO[classification.persona] : null;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F8F6FF, #F0EDFA, #E8F4F8)', minHeight: '100dvh' }}>
      {/* 柔和背景装饰 */}
      <div className="soft-bg" />

      <div className="flex-1 flex items-center justify-center relative z-10 px-6">
        <AnimatePresence mode="wait">
          {/* Step 0: 欢迎 */}
          {step === 0 && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} className="text-center max-w-sm">
              <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }} className="text-7xl mb-8">🎭</motion.div>
              <h1 className="text-xl font-medium mb-4" style={{ color: '#2D2B55' }}>
                你脑子里的戏，现在有多热闹？
              </h1>
              <div className="my-8">
                <input type="range" min="1" max="10" value={noiseLevel}
                  onChange={e => setNoiseLevel(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between mt-2">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>安静</span>
                  <span className="text-2xl font-medium" style={{ color: '#8B7CF7' }}>{noiseLevel}</span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>好多出戏</span>
                </div>
              </div>
              <motion.button onClick={() => setStep(1)} className="btn-primary px-10 py-3 text-base"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>继续</motion.button>
            </motion.div>
          )}

          {/* Step 1: 解释 */}
          {step === 1 && (
            <motion.div key="explain" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} className="text-center max-w-sm">
              <div className="space-y-6 mb-10">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="text-lg leading-relaxed" style={{ color: '#2D2B55' }}>
                  那些台词<strong style={{ color: '#8B7CF7' }}>不是你</strong>。
                </motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                  className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  它们只是舞台上的表演。
                </motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}
                  className="text-lg leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  你不需要每出戏都入戏。
                </motion.p>
              </div>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
                onClick={() => setStep(2)} className="btn-primary px-10 py-3 text-base"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>试一试</motion.button>
            </motion.div>
          )}

          {/* Step 2: 输入 */}
          {step === 2 && (
            <motion.div key="capture" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} className="w-full max-w-sm">
              <p className="text-center text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                试试写下一句脑子里正在上演的台词
              </p>
              <textarea ref={textareaRef} value={inputText} onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !isProcessing) { e.preventDefault(); handleInputSubmit(); } }}
                placeholder="比如：我今天什么都没做好..."
                rows={3} maxLength={200} className="w-full"
                style={{
                  background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(139,124,247,0.15)',
                  borderRadius: '20px', color: '#2D2B55', padding: '16px 20px', fontSize: '16px',
                  lineHeight: 1.6, resize: 'none', outline: 'none', fontFamily: 'inherit',
                  backdropFilter: 'blur(12px)',
                }} autoFocus />
              {inputText.trim() && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-6">
                  <motion.button onClick={handleInputSubmit} disabled={isProcessing}
                    className="btn-primary px-10 py-3 text-base"
                    style={{ opacity: isProcessing ? 0.6 : 1, cursor: isProcessing ? 'wait' : 'pointer' }}
                    whileHover={isProcessing ? {} : { scale: 1.05 }} whileTap={isProcessing ? {} : { scale: 0.95 }}>
                    {isProcessing ? '⏳ AI 分析中...' : '搬上舞台 🎭'}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: 改写展示 */}
          {step === 3 && (
            <motion.div key="rewrite" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} className="w-full max-w-sm text-center">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                className="glass-card p-4 mx-auto mb-6 inline-block" style={{ maxWidth: '300px' }}>
                <p className="text-sm" style={{ color: '#2D2B55' }}>{submittedText}</p>
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>看看另一种说法：</motion.p>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                className="rounded-2xl p-4 mx-auto mb-6" style={{ background: 'rgba(78,205,196,0.1)',
                  border: '1.5px solid rgba(78,205,196,0.2)', maxWidth: '300px' }}>
                <p className="text-sm" style={{ color: '#2A9D8F' }}>{rewritten}</p>
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
                className="text-xs mb-6" style={{ color: 'var(--text-tertiary)' }}>感觉有什么不同吗？</motion.p>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
                onClick={() => setStep(4)} className="btn-primary px-10 py-3 text-base"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>继续</motion.button>
            </motion.div>
          )}

          {/* Step 4: 释放 */}
          {step === 4 && (
            <motion.div key="release" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} className="text-center max-w-sm">
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>现在，让这出戏落幕 🎭</p>
              <AnimatePresence>
                {!blown && (
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                    exit={{ opacity: 0, y: -200, scale: 0, transition: { duration: 1 } }}
                    className="glass-card p-4 mx-auto mb-8 inline-block" style={{ maxWidth: '300px' }}>
                    <p className="text-sm" style={{ color: '#2D2B55' }}>{rewritten}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {!blown ? (
                <motion.button onClick={handleBlow} className="btn-primary px-12 py-4 text-base"
                  style={{ background: 'linear-gradient(135deg, #4ECDC4, #45B7AA)' }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>🎭 落幕</motion.button>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <p className="text-lg" style={{ color: '#4ECDC4' }}>幕布落下了... 🎭</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 5: 角色 */}
          {step === 5 && persona && (
            <motion.div key="persona" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} className="text-center max-w-sm">
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-6">{persona.emoji}</motion.div>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>刚才念台词的，可能是你脑子里的</p>
              <h2 className="text-xl font-medium mb-2" style={{ color: '#8B7CF7' }}>
                「{persona.name}」{persona.emoji}
              </h2>
              <p className="text-xs mb-8" style={{ color: 'var(--text-tertiary)' }}>{persona.description}</p>
              <p className="text-xs mb-6" style={{ color: 'var(--text-hint)' }}>别担心，以后你会越来越认识这些演员</p>
              <motion.button onClick={() => setStep(6)} className="btn-primary px-10 py-3 text-base"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>继续</motion.button>
            </motion.div>
          )}

          {step === 5 && !persona && (
            <motion.div key="persona-fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onAnimationComplete={() => setStep(6)} />
          )}

          {/* Step 6: 完成 */}
          {step === 6 && (
            <motion.div key="complete" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} className="text-center max-w-sm">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl mb-6">✨</motion.div>
              <div className="space-y-4 mb-8">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="text-lg" style={{ color: '#2D2B55' }}>
                  这就是「出戏」—— 从念头的剧本里，退后一步。
                </motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                  className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  当你需要的时候，随时回来。
                </motion.p>
              </div>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                onClick={handleComplete} className="btn-primary px-12 py-4 text-base"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>开始出戏 🎭</motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 步骤指示器 */}
      <div className="relative z-10 flex justify-center gap-2 pb-8">
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i === step ? '#8B7CF7' : i < step ? 'rgba(139,124,247,0.4)' : 'rgba(139,124,247,0.12)',
            }} />
        ))}
      </div>
    </div>
  );
}
