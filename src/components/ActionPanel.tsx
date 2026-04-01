/**
 * 解钩操作面板 — 柔和治愈风
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThoughtStore } from '../store';
import { speakThought, FUNNY_VOICES, generateLabel, generateLabelLLM, recommendMethods, generateBehaviorSuggestion, generateBehaviorSuggestionLLM } from '../ai-service';
import type { VoiceOption } from '../ai-service';
import { PERSONA_INFO, DISTORTION_NAMES } from '../types';
import type { BehaviorSuggestion } from '../types';
import { isLLMEnabled } from '../llm-client';

export default function ActionPanel() {
  const selectedId = useThoughtStore(s => s.selectedThoughtId);
  const thoughts = useThoughtStore(s => s.thoughts);
  const releaseThought = useThoughtStore(s => s.releaseThought);
  const storeThought = useThoughtStore(s => s.storeThought);
  const setRewritten = useThoughtStore(s => s.setRewritten);
  const requestRewrite = useThoughtStore(s => s.requestRewrite);
  const clearRewrite = useThoughtStore(s => s.clearRewrite);
  const selectThought = useThoughtStore(s => s.selectThought);
  const addTagToThought = useThoughtStore(s => s.addTagToThought);
  const isRewriting = useThoughtStore(s => s.isRewriting);
  const rewriteVariants = useThoughtStore(s => s.rewriteVariants);

  const [showVoices, setShowVoices] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [meltingId, setMeltingId] = useState<string | null>(null);
  const [shrinkingId, setShrinkingId] = useState<string | null>(null);
  const [observing, setObserving] = useState(false);
  const [labelGenerated, setLabelGenerated] = useState<string | null>(null);

  const thought = thoughts.find(t => t.uid === selectedId && t.status === 'active');

  const recommendations = useMemo(() => {
    if (!thought) return [];
    return recommendMethods(thought, thoughts);
  }, [thought, thoughts]);

  const topRecommended = recommendations[0]?.method;

  const [behaviorSuggestion, setBehaviorSuggestion] = useState<BehaviorSuggestion | null>(null);

  useEffect(() => {
    if (!thought) { setBehaviorSuggestion(null); return; }
    let cancelled = false;
    if (isLLMEnabled()) {
      generateBehaviorSuggestionLLM(thought).then(result => {
        if (!cancelled) setBehaviorSuggestion(result);
      }).catch(() => {
        if (!cancelled) setBehaviorSuggestion(generateBehaviorSuggestion(thought));
      });
    } else {
      setBehaviorSuggestion(generateBehaviorSuggestion(thought));
    }
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thought?.uid]);

  if (!thought) return null;

  const persona = PERSONA_INFO[thought.persona];
  const distortionName = DISTORTION_NAMES[thought.cognitiveDistortion];

  const resetPanels = () => {
    setShowVoices(false);
    clearRewrite();
    setObserving(false);
    setLabelGenerated(null);
  };

  const handleObserve = () => {
    resetPanels();
    setObserving(true);
    setTimeout(() => {
      releaseThought(thought.uid, 'observe');
      setObserving(false);
      selectThought(null);
    }, 3000);
  };

  const handleLabel = async () => {
    resetPanels();
    let label: string;
    if (isLLMEnabled()) {
      try { label = await generateLabelLLM(thought.content, thought.emotion, thought.cognitiveDistortion); }
      catch { label = generateLabel(thought.content, thought.emotion, thought.cognitiveDistortion); }
    } else {
      label = generateLabel(thought.content, thought.emotion, thought.cognitiveDistortion);
    }
    setLabelGenerated(label);
    addTagToThought(thought.uid, label);
  };

  const handleRewrite = () => { resetPanels(); requestRewrite(thought.uid); };
  const handleSelectRewrite = (text: string) => { setRewritten(thought.uid, text); clearRewrite(); };

  const handleVoice = () => { resetPanels(); setShowVoices(true); };
  const handleSpeak = async (voice: VoiceOption) => {
    setIsSpeaking(true);
    try { await speakThought(thought.content, voice); } catch { /* ignore */ }
    setIsSpeaking(false);
  };

  const handleShrink = () => {
    resetPanels();
    setShrinkingId(thought.uid);
    useThoughtStore.setState({ releasingMethod: 'resize' });
    setTimeout(() => { releaseThought(thought.uid, 'resize'); setShrinkingId(null); selectThought(null); }, 1100);
  };

  const handleBlow = () => {
    resetPanels();
    setReleasingId(thought.uid);
    useThoughtStore.setState({ releasingMethod: 'blow' });
    setTimeout(() => { releaseThought(thought.uid, 'blow'); setReleasingId(null); selectThought(null); }, 2800);
  };

  const handleMelt = () => {
    resetPanels();
    setMeltingId(thought.uid);
    useThoughtStore.setState({ releasingMethod: 'melt' });
    setTimeout(() => { releaseThought(thought.uid, 'melt'); setMeltingId(null); selectThought(null); }, 2000);
  };

  const handleStore = () => { resetPanels(); storeThought(thought.uid); selectThought(null); };

  return (
    <AnimatePresence>
      <motion.div
        key="action-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md mx-auto"
      >
        {/* 念头信息 */}
        <div className="text-center mb-3">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {persona.emoji} {persona.name} · {distortionName}
          </span>
        </div>

        {/* 行为建议 */}
        <AnimatePresence>
          {behaviorSuggestion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-3 rounded-2xl"
              style={{
                background: 'rgba(255,179,107,0.08)',
                border: '1.5px solid rgba(255,179,107,0.15)',
              }}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-lg">{behaviorSuggestion.emoji}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium" style={{ color: '#E8A850' }}>
                    💡 {behaviorSuggestion.trigger}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {behaviorSuggestion.suggestion}
                  </p>
                  {behaviorSuggestion.duration && (
                    <span className="text-[10px] mt-1.5 inline-block px-2.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,179,107,0.1)', color: '#E8A850' }}>
                      ⏱️ {behaviorSuggestion.duration}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI 推荐提示 */}
        {recommendations.length > 0 && recommendations[0].isPersonalized && (
          <div className="text-center mb-2">
            <span className="text-[10px] px-3 py-1 rounded-full font-medium"
              style={{ background: 'rgba(139,124,247,0.08)', color: '#8B7CF7' }}>
              ✨ AI 推荐了最适合你的操作
            </span>
          </div>
        )}

        {/* 8 种操作按钮 */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <ActionButton emoji="🫧" label="看见" onClick={handleObserve} active={observing}
            disabled={!!releasingId || !!meltingId || !!shrinkingId} recommended={topRecommended === 'observe'} />
          <ActionButton emoji="🏷️" label="标签" onClick={handleLabel} active={!!labelGenerated}
            disabled={!!releasingId || !!meltingId || !!shrinkingId} recommended={topRecommended === 'label'} />
          <ActionButton emoji="✏️" label="改写" onClick={handleRewrite} active={!!rewriteVariants}
            disabled={!!releasingId || !!meltingId || !!shrinkingId} recommended={topRecommended === 'rewrite'} />
          <ActionButton emoji="🎵" label="变声" onClick={handleVoice} active={showVoices}
            disabled={isSpeaking || !!releasingId || !!meltingId || !!shrinkingId} recommended={topRecommended === 'voice'} />
          <ActionButton emoji="🔍" label="缩小" onClick={handleShrink} active={!!shrinkingId}
            disabled={!!releasingId || !!meltingId} statusText={shrinkingId ? '缩小中...' : undefined} recommended={topRecommended === 'resize'} />
          <ActionButton emoji="💨" label="吹走" onClick={handleBlow} active={!!releasingId}
            disabled={!!meltingId || !!shrinkingId} statusText={releasingId ? '飘走了...' : undefined} recommended={topRecommended === 'blow'} />
          <ActionButton emoji="🫠" label="融化" onClick={handleMelt} active={!!meltingId}
            disabled={!!releasingId || !!shrinkingId} statusText={meltingId ? '融化中...' : undefined} recommended={topRecommended === 'melt'} />
          <ActionButton emoji="📌" label="暂存" onClick={handleStore}
            disabled={!!releasingId || !!meltingId || !!shrinkingId} recommended={topRecommended === 'store'} />
        </div>

        {/* 看见效果 */}
        <AnimatePresence>
          {observing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rewrite-panel p-5 mb-3 text-center"
            >
              <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }} className="text-3xl mb-2">🫧</motion.div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                坐在观众席，安静地看着这场戏...
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                它只是一段台词，不是你的人生
              </p>
              <motion.div className="mt-3 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(139,124,247,0.1)' }}>
                <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'linear' }} className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #8B7CF7, #4ECDC4)' }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 标签结果 */}
        <AnimatePresence>
          {labelGenerated && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="rewrite-panel p-4 mb-3">
              <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>🏷️ AI 为这个念头贴上了标签：</p>
              <p className="text-sm font-medium" style={{ color: '#8B7CF7' }}>"{labelGenerated}"</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-hint)' }}>给念头贴个标签，帮你从剧情中抽身</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 改写结果 */}
        <AnimatePresence>
          {isRewriting && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="rewrite-panel p-4 mb-3">
              <div className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-lg">✨</motion.div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {isLLMEnabled() ? '🧠 AI 正在深度思考...' : 'AI 正在思考...'}
                </span>
              </div>
            </motion.div>
          )}
          {rewriteVariants && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="rewrite-panel p-4 mb-3">
              <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>换一种台词，感受也会不同 ✏️</p>
              <div className="space-y-2">
                {rewriteVariants.map((variant, i) => (
                  <motion.button key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }} onClick={() => handleSelectRewrite(variant.text)}
                    className="w-full text-left p-3 rounded-xl transition-all"
                    style={{ background: 'rgba(139,124,247,0.04)', border: '1.5px solid rgba(139,124,247,0.08)' }}
                    whileHover={{ scale: 1.01, background: 'rgba(139,124,247,0.08)' }}>
                    <span className="text-[10px] block mb-1" style={{ color: '#4ECDC4' }}>{variant.techniqueName}</span>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{variant.text}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 变声面板 */}
        <AnimatePresence>
          {showVoices && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="rewrite-panel p-4 mb-3">
              <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>换个声音念出来 🎵</p>
              <div className="grid grid-cols-2 gap-2">
                {FUNNY_VOICES.map(voice => (
                  <motion.button key={voice.id} onClick={() => handleSpeak(voice)} disabled={isSpeaking}
                    className="flex items-center gap-2 p-2.5 rounded-xl transition-all"
                    style={{ background: 'rgba(139,124,247,0.04)', border: '1.5px solid rgba(139,124,247,0.08)',
                      cursor: isSpeaking ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                    whileHover={isSpeaking ? {} : { scale: 1.02 }} whileTap={isSpeaking ? {} : { scale: 0.95 }}>
                    <span className="text-lg">{voice.emoji}</span>
                    <div className="text-left">
                      <span className="text-xs block" style={{ color: 'var(--text-primary)' }}>{voice.name}</span>
                      {voice.description && (
                        <span className="text-[9px] block" style={{ color: 'var(--text-tertiary)' }}>{voice.description}</span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center">
          <p className="text-xs" style={{ color: 'var(--text-hint)' }}>不是消灭念头，而是从中退后一步</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ActionButton({ emoji, label, onClick, active, disabled, statusText, recommended }: {
  emoji: string; label: string; onClick: () => void; active?: boolean; disabled?: boolean;
  statusText?: string; recommended?: boolean;
}) {
  return (
    <motion.button className="action-btn-sm" onClick={onClick}
      whileHover={disabled ? {} : { scale: 1.05 }} whileTap={disabled ? {} : { scale: 0.95 }}
      disabled={disabled}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
        padding: '8px 4px', borderRadius: '16px',
        background: recommended ? 'rgba(139,124,247,0.1)' : active ? 'rgba(139,124,247,0.06)' : 'rgba(255,255,255,0.7)',
        border: `1.5px solid ${recommended ? 'rgba(139,124,247,0.3)' : active ? 'rgba(139,124,247,0.15)' : 'rgba(139,124,247,0.06)'}`,
        color: 'var(--text-primary)', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, fontSize: '12px', fontFamily: 'inherit',
        transition: 'all 0.25s ease', position: 'relative',
        boxShadow: recommended ? '0 4px 12px rgba(139,124,247,0.12)' : 'none',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      }}>
      {recommended && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
          style={{
            position: 'absolute', top: '-5px', right: '-5px', fontSize: '10px',
            background: 'linear-gradient(135deg, #8B7CF7, #A78BFA)', borderRadius: '50%',
            width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, boxShadow: '0 2px 8px rgba(139,124,247,0.3)',
          }}>✨</motion.span>
      )}
      <span style={{ fontSize: '20px', lineHeight: 1 }}>{emoji}</span>
      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{statusText || label}</span>
    </motion.button>
  );
}
