/**
 * 解钩操作面板 — Phase 1: 完整 8 种操作
 * 🫧 看见 / 🏷️ 贴标签 / ✏️ 改写 / 🎵 变声 / 🔍 缩小 / 💨 吹走 / 🫠 融化 / 📌 暂存
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThoughtStore } from '../store';
import { speakThought, FUNNY_VOICES, generateLabel } from '../ai-service';
import type { VoiceOption } from '../ai-service';
import { PERSONA_INFO, DISTORTION_NAMES } from '../types';

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

  // ===== 🏷️ 贴标签操作 =====
  const handleLabel = () => {
    resetPanels();
    const label = generateLabel(thought.content, thought.emotion, thought.cognitiveDistortion);
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

        {/* 8 种操作按钮 — 2行4列 */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {/* Row 1 */}
          <ActionButton
            emoji="🫧" label="看见"
            onClick={handleObserve}
            active={observing}
            disabled={!!releasingId || !!meltingId || !!shrinkingId}
          />
          <ActionButton
            emoji="🏷️" label="标签"
            onClick={handleLabel}
            active={!!labelGenerated}
            disabled={!!releasingId || !!meltingId || !!shrinkingId}
          />
          <ActionButton
            emoji="✏️" label="改写"
            onClick={handleRewrite}
            active={!!rewriteVariants}
            disabled={!!releasingId || !!meltingId || !!shrinkingId}
          />
          <ActionButton
            emoji="🎵" label="变声"
            onClick={handleVoice}
            active={showVoices}
            disabled={isSpeaking || !!releasingId || !!meltingId || !!shrinkingId}
          />

          {/* Row 2 */}
          <ActionButton
            emoji="🔍" label="缩小"
            onClick={handleShrink}
            active={!!shrinkingId}
            disabled={!!releasingId || !!meltingId}
            statusText={shrinkingId ? '缩小中...' : undefined}
          />
          <ActionButton
            emoji="💨" label="吹走"
            onClick={handleBlow}
            active={!!releasingId}
            disabled={!!meltingId || !!shrinkingId}
            statusText={releasingId ? '飘走了...' : undefined}
          />
          <ActionButton
            emoji="🫠" label="融化"
            onClick={handleMelt}
            active={!!meltingId}
            disabled={!!releasingId || !!shrinkingId}
            statusText={meltingId ? '融化中...' : undefined}
          />
          <ActionButton
            emoji="📌" label="暂存"
            onClick={handleStore}
            disabled={!!releasingId || !!meltingId || !!shrinkingId}
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
                  AI 正在思考另一种说法...
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

        {/* 变声选择面板 */}
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
                    className="flex items-center gap-2 p-3 rounded-xl transition-all hover:bg-white/[0.06]"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      cursor: isSpeaking ? 'not-allowed' : 'pointer',
                    }}
                    whileHover={isSpeaking ? {} : { scale: 1.02 }}
                    whileTap={isSpeaking ? {} : { scale: 0.95 }}
                  >
                    <span className="text-xl">{voice.emoji}</span>
                    <span className="text-sm" style={{ color: 'rgba(230,230,250,0.7)' }}>
                      {voice.name}
                    </span>
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

// ===== 操作按钮子组件 =====
function ActionButton({
  emoji,
  label,
  onClick,
  active,
  disabled,
  statusText,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  statusText?: string;
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
        gap: '4px',
        padding: '10px 6px',
        borderRadius: '14px',
        background: active ? 'rgba(139,120,255,0.1)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${active ? 'rgba(139,120,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
        color: '#c0c0e0',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        fontSize: '12px',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
      }}
    >
      <span style={{ fontSize: '20px', lineHeight: 1 }}>{emoji}</span>
      <span style={{ fontSize: '11px' }}>{statusText || label}</span>
    </motion.button>
  );
}
