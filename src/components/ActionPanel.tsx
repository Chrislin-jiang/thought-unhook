/**
 * 解钩操作面板 — Phase 4: LLM 增强版
 * 🫧 看见 / 🏷️ 贴标签 / ✏️ 改写 / 🎵 变声 / 🔍 缩小 / 💨 吹走 / 🫠 融化 / 📌 暂存
 * ⭐ AI 推荐徽标 + 💡 行为建议 + 🧠 LLM 智能增强
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

  // Phase 3: AI 个性化推荐
  const recommendations = useMemo(() => {
    if (!thought) return [];
    return recommendMethods(thought, thoughts);
  }, [thought, thoughts]);

  const topRecommended = recommendations[0]?.method;

  // Phase 4: 行为建议（LLM 优先，失败降级本地）
  const [behaviorSuggestion, setBehaviorSuggestion] = useState<BehaviorSuggestion | null>(null);

  useEffect(() => {
    if (!thought) {
      setBehaviorSuggestion(null);
      return;
    }

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

  // ===== 🫧 看见操作 =====
  const handleObserve = () => {
    resetPanels();
    setObserving(true);
    // 3秒后自动标记为"已看见"
    setTimeout(() => {
      releaseThought(thought.uid, 'observe');
      setObserving(false);
      selectThought(null);
    }, 3000);
  };

  // ===== 🏷️ 贴标签操作（LLM 优先，失败降级本地）=====
  const handleLabel = async () => {
    resetPanels();

    let label: string;
    if (isLLMEnabled()) {
      try {
        label = await generateLabelLLM(thought.content, thought.emotion, thought.cognitiveDistortion);
      } catch {
        label = generateLabel(thought.content, thought.emotion, thought.cognitiveDistortion);
      }
    } else {
      label = generateLabel(thought.content, thought.emotion, thought.cognitiveDistortion);
    }

    setLabelGenerated(label);
    addTagToThought(thought.uid, label);
  };

  // ===== ✏️ 改写操作 =====
  const handleRewrite = () => {
    resetPanels();
    requestRewrite(thought.uid);
  };

  const handleSelectRewrite = (text: string) => {
    setRewritten(thought.uid, text);
    clearRewrite();
  };

  // ===== 🎵 变声操作 =====
  const handleVoice = () => {
    resetPanels();
    setShowVoices(true);
  };

  const handleSpeak = async (voice: VoiceOption) => {
    setIsSpeaking(true);
    try {
      await speakThought(thought.content, voice);
    } catch {
      // ignore
    }
    setIsSpeaking(false);
  };

  // ===== 🔍 缩小操作 =====
  const handleShrink = () => {
    resetPanels();
    setShrinkingId(thought.uid);
    setTimeout(() => {
      releaseThought(thought.uid, 'resize');
      setShrinkingId(null);
      selectThought(null);
    }, 1500);
  };

  // ===== 💨 吹走操作 =====
  const handleBlow = () => {
    resetPanels();
    setReleasingId(thought.uid);
    setTimeout(() => {
      releaseThought(thought.uid, 'blow');
      setReleasingId(null);
      selectThought(null);
    }, 700);
  };

  // ===== 🫠 融化操作 =====
  const handleMelt = () => {
    resetPanels();
    setMeltingId(thought.uid);
    setTimeout(() => {
      releaseThought(thought.uid, 'melt');
      setMeltingId(null);
      selectThought(null);
    }, 2000);
  };

  // ===== 📌 暂存操作 =====
  const handleStore = () => {
    resetPanels();
    storeThought(thought.uid);
    selectThought(null);
  };

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
        {/* 念头信息头 */}
        <div className="text-center mb-3">
          <span className="text-sm" style={{ color: 'rgba(200,200,230,0.5)' }}>
            {persona.emoji} {persona.name} · {distortionName}
          </span>
        </div>

        {/* Phase 3: 行为建议 */}
        <AnimatePresence>
          {behaviorSuggestion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 p-2 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,200,100,0.08), rgba(255,180,100,0.04))',
                border: '1px solid rgba(255,200,100,0.12)',
              }}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{behaviorSuggestion.emoji}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium" style={{ color: 'rgba(255,200,100,0.7)' }}>
                    💡 {behaviorSuggestion.trigger}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(200,200,230,0.7)' }}>
                    {behaviorSuggestion.suggestion}
                  </p>
                  {behaviorSuggestion.duration && (
                    <span className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,200,100,0.1)', color: 'rgba(255,200,100,0.5)' }}>
                      ⏱️ {behaviorSuggestion.duration}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 3: AI 推荐提示 */}
        {recommendations.length > 0 && recommendations[0].isPersonalized && (
          <div className="text-center mb-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(139,120,255,0.1)', color: 'rgba(139,120,255,0.6)' }}>
              ⭐ AI 根据你的习惯推荐了操作方式
            </span>
          </div>
        )}

        {/* 8 种操作按钮 — 2行4列 */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {/* Row 1 */}
          <ActionButton
            emoji="🫧" label="看见"
            onClick={handleObserve}
            active={observing}
            disabled={!!releasingId || !!meltingId || !!shrinkingId}
            recommended={topRecommended === 'observe'}
          />
          <ActionButton
            emoji="🏷️" label="标签"
            onClick={handleLabel}
            active={!!labelGenerated}
            disabled={!!releasingId || !!meltingId || !!shrinkingId}
            recommended={topRecommended === 'label'}
          />
          <ActionButton
            emoji="✏️" label="改写"
            onClick={handleRewrite}
            active={!!rewriteVariants}
            disabled={!!releasingId || !!meltingId || !!shrinkingId}
            recommended={topRecommended === 'rewrite'}
          />
          <ActionButton
            emoji="🎵" label="变声"
            onClick={handleVoice}
            active={showVoices}
            disabled={isSpeaking || !!releasingId || !!meltingId || !!shrinkingId}
            recommended={topRecommended === 'voice'}
          />

          {/* Row 2 */}
          <ActionButton
            emoji="🔍" label="缩小"
            onClick={handleShrink}
            active={!!shrinkingId}
            disabled={!!releasingId || !!meltingId}
            statusText={shrinkingId ? '缩小中...' : undefined}
            recommended={topRecommended === 'resize'}
          />
          <ActionButton
            emoji="💨" label="吹走"
            onClick={handleBlow}
            active={!!releasingId}
            disabled={!!meltingId || !!shrinkingId}
            statusText={releasingId ? '飘走了...' : undefined}
            recommended={topRecommended === 'blow'}
          />
          <ActionButton
            emoji="🫠" label="融化"
            onClick={handleMelt}
            active={!!meltingId}
            disabled={!!releasingId || !!shrinkingId}
            statusText={meltingId ? '融化中...' : undefined}
            recommended={topRecommended === 'melt'}
          />
          <ActionButton
            emoji="📌" label="暂存"
            onClick={handleStore}
            disabled={!!releasingId || !!meltingId || !!shrinkingId}
            recommended={topRecommended === 'store'}
          />
        </div>

        {/* 看见效果 */}
        <AnimatePresence>
          {observing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rewrite-panel p-4 mb-3 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl mb-2"
              >
                🫧
              </motion.div>
              <p className="text-sm" style={{ color: 'rgba(200,200,230,0.6)' }}>
                安静地看着这个念头...
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(200,200,230,0.3)' }}>
                它只是一个气泡，不是一个事实
              </p>
              <motion.div
                className="mt-3 h-1 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, rgba(139,120,255,0.5), rgba(100,180,255,0.5))' }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 标签结果 */}
        <AnimatePresence>
          {labelGenerated && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rewrite-panel p-4 mb-3"
            >
              <p className="text-xs mb-2" style={{ color: 'rgba(200,200,230,0.4)' }}>
                🏷️ AI 为这个念头贴上了标签：
              </p>
              <p className="text-sm" style={{ color: 'rgba(139,180,255,0.85)' }}>
                "{labelGenerated}"
              </p>
              <p className="text-xs mt-2" style={{ color: 'rgba(200,200,230,0.3)' }}>
                给念头分类，帮助你从中退一步
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 改写结果面板 */}
        <AnimatePresence>
          {isRewriting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rewrite-panel p-4 mb-3"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="text-lg"
                >
                  ✨
                </motion.div>
                <span className="text-sm" style={{ color: 'rgba(200,200,230,0.6)' }}>
                  {isLLMEnabled() ? '🧠 AI 大模型正在深度思考...' : 'AI 正在思考另一种说法...'}
                </span>
              </div>
            </motion.div>
          )}

          {rewriteVariants && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rewrite-panel p-4 mb-3"
            >
              <p className="text-xs mb-3" style={{ color: 'rgba(200,200,230,0.4)' }}>
                换一种说法，感觉可能不一样了 ✏️
              </p>
              <div className="space-y-2">
                {rewriteVariants.map((variant, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    onClick={() => handleSelectRewrite(variant.text)}
                    className="w-full text-left p-3 rounded-xl transition-all hover:bg-white/[0.06]"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <span
                      className="text-[10px] block mb-1"
                      style={{ color: 'rgba(139,220,180,0.5)' }}
                    >
                      {variant.techniqueName}
                    </span>
                    <span className="text-sm" style={{ color: 'rgba(200,230,200,0.85)' }}>
                      {variant.text}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 变声选择面板 — Phase 3: 8种音色 */}
        <AnimatePresence>
          {showVoices && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rewrite-panel p-4 mb-3"
            >
              <p className="text-xs mb-3" style={{ color: 'rgba(200,200,230,0.4)' }}>
                用搞笑的声音读一遍，念头就没那么可怕了 🎵
              </p>
              <div className="grid grid-cols-2 gap-2">
                {FUNNY_VOICES.map(voice => (
                  <motion.button
                    key={voice.id}
                    onClick={() => handleSpeak(voice)}
                    disabled={isSpeaking}
                    className="flex items-center gap-2 p-2.5 rounded-xl transition-all hover:bg-white/[0.06]"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      cursor: isSpeaking ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                    }}
                    whileHover={isSpeaking ? {} : { scale: 1.02 }}
                    whileTap={isSpeaking ? {} : { scale: 0.95 }}
                  >
                    <span className="text-lg">{voice.emoji}</span>
                    <div className="text-left">
                      <span className="text-xs block" style={{ color: 'rgba(230,230,250,0.7)' }}>
                        {voice.name}
                      </span>
                      {voice.description && (
                        <span className="text-[9px] block" style={{ color: 'rgba(200,200,230,0.3)' }}>
                          {voice.description}
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 引导语 */}
        <div className="text-center">
          <p className="text-xs" style={{ color: 'rgba(200,200,230,0.25)' }}>
            不是反驳它，而是让它"变轻"
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ===== 操作按钮子组件 — 赛博风 =====
function ActionButton({
  emoji,
  label,
  onClick,
  active,
  disabled,
  statusText,
  recommended,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  statusText?: string;
  recommended?: boolean;
}) {
  return (
    <motion.button
      className="action-btn-sm"
      onClick={onClick}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      disabled={disabled}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        padding: '6px 4px',
        borderRadius: '12px',
        background: recommended
          ? 'rgba(0,240,255,0.08)'
          : active ? 'rgba(0,240,255,0.05)' : 'rgba(0,240,255,0.02)',
        border: `1px solid ${
          recommended
            ? 'rgba(0,240,255,0.35)'
            : active ? 'rgba(0,240,255,0.2)' : 'rgba(0,240,255,0.06)'
        }`,
        color: '#c0d8e8',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        fontSize: '12px',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
        position: 'relative',
        boxShadow: recommended ? '0 0 12px rgba(0,240,255,0.12)' : 'none',
      }}
    >
      {recommended && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            fontSize: '10px',
            background: 'linear-gradient(135deg, #00f0ff, #00d4ff)',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#050510',
            fontWeight: 700,
            boxShadow: '0 0 8px rgba(0,240,255,0.6), 0 0 16px rgba(0,240,255,0.2)',
          }}
        >
          ⭐
        </motion.span>
      )}
      <span style={{ fontSize: '18px', lineHeight: 1 }}>{emoji}</span>
      <span style={{ fontSize: '10px' }}>{statusText || label}</span>
    </motion.button>
  );
}
