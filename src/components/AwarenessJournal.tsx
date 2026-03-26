/**
 * 觉察日志 — Phase 2.1 增强版
 * 
 * 增强功能：
 * - 认知扭曲分布饼图
 * - 角色出场频率（可展开角色卡片）
 * - 念头词云
 * - 温柔洞察增强
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useThoughtStore } from '../store';
import { EMOTION_NAMES, EMOTION_COLORS, PERSONA_INFO, DISTORTION_NAMES } from '../types';
import type { EmotionType, PersonaType, CognitiveDistortion } from '../types';
import PersonaCard from './PersonaCard';

export default function AwarenessJournal() {
  const thoughts = useThoughtStore(s => s.thoughts);
  const getDailyStats = useThoughtStore(s => s.getDailyStats);
  const getWordCloud = useThoughtStore(s => s.getWordCloud);
  const stats = useMemo(() => getDailyStats(7), [getDailyStats, thoughts]);
  const [expandedPersona, setExpandedPersona] = useState<PersonaType | null>(null);

  const totalThoughts = thoughts.length;
  const releasedThoughts = thoughts.filter(t => t.status === 'released');
  const releaseRate = totalThoughts > 0 ? Math.round((releasedThoughts.length / totalThoughts) * 100) : 0;

  // 情绪分布
  const emotionDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const t of thoughts) {
      dist[t.emotion] = (dist[t.emotion] || 0) + 1;
    }
    return Object.entries(dist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [thoughts]);

  // 角色出场
  const personaDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const t of thoughts) {
      dist[t.persona] = (dist[t.persona] || 0) + 1;
    }
    return Object.entries(dist)
      .sort((a, b) => b[1] - a[1]);
  }, [thoughts]);

  // 认知扭曲分布
  const distortionDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const t of thoughts) {
      if (t.cognitiveDistortion !== 'unknown') {
        dist[t.cognitiveDistortion] = (dist[t.cognitiveDistortion] || 0) + 1;
      }
    }
    return Object.entries(dist)
      .sort((a, b) => b[1] - a[1]);
  }, [thoughts]);

  // 念头词云
  const wordCloud = useMemo(() => getWordCloud(), [getWordCloud, thoughts]);

  // 温柔洞察
  const insight = useMemo(() => generateInsight(thoughts), [thoughts]);

  if (totalThoughts === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <span className="text-4xl block mb-4">📊</span>
          <p className="text-sm" style={{ color: 'rgba(200,200,230,0.5)' }}>
            还没有觉察记录
          </p>
          <p className="text-xs mt-2" style={{ color: 'rgba(200,200,230,0.3)' }}>
            去「念头空间」捕捉一些念头吧
          </p>
        </div>
      </div>
    );
  }

  const totalDistortions = distortionDistribution.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 relative z-10">
      {/* 温柔洞察卡片 */}
      {insight && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(139,120,255,0.08), rgba(100,180,255,0.05))',
            border: '1px solid rgba(139,120,255,0.15)',
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(200,200,230,0.8)' }}>
            {insight}
          </p>
        </motion.div>
      )}

      {/* 总览数据 */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="总念头数" value={totalThoughts} emoji="🫧" />
        <StatCard label="已释放" value={releasedThoughts.length} emoji="💨" />
        <StatCard label="释放率" value={`${releaseRate}%`} emoji="📈" />
      </div>

      {/* 7天时间线 */}
      <Section title="📅 最近7天">
        <div className="flex items-end justify-between gap-2 h-24">
          {[...stats].reverse().map((day, i) => {
            const maxCount = Math.max(...stats.map(d => d.thoughtCount), 1);
            const height = day.thoughtCount > 0 ? Math.max(12, (day.thoughtCount / maxCount) * 80) : 4;
            const dayLabel = new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' });
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px]" style={{ color: 'rgba(200,200,230,0.4)' }}>
                  {day.thoughtCount || ''}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height }}
                  transition={{ delay: i * 0.1 }}
                  className="w-full rounded-t-lg"
                  style={{
                    background: day.thoughtCount > 0
                      ? 'linear-gradient(to top, rgba(139,120,255,0.4), rgba(100,180,255,0.3))'
                      : 'rgba(255,255,255,0.05)',
                    minHeight: '4px',
                  }}
                />
                <span className="text-[9px]" style={{ color: 'rgba(200,200,230,0.3)' }}>
                  {dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* 🧠 认知扭曲分布饼图 — Phase 2.1 新增 */}
      {distortionDistribution.length > 0 && (
        <Section title="🧠 认知扭曲分布">
          {/* 环形图 */}
          <div className="flex items-center gap-4 mb-3">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {(() => {
                  let accumulated = 0;
                  const pieColors = [
                    'rgba(255,200,100,0.6)', 'rgba(139,120,255,0.6)', 'rgba(100,180,255,0.6)',
                    'rgba(255,130,130,0.6)', 'rgba(139,220,180,0.6)', 'rgba(200,150,255,0.6)',
                    'rgba(255,180,130,0.5)', 'rgba(150,200,255,0.5)',
                  ];
                  return distortionDistribution.map(([, count], i) => {
                    const pct = (count / totalDistortions) * 100;
                    const offset = accumulated;
                    accumulated += pct;
                    return (
                      <circle
                        key={i}
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke={pieColors[i % pieColors.length]}
                        strokeWidth="18"
                        strokeDasharray={`${pct * 2.51} ${251.2 - pct * 2.51}`}
                        strokeDashoffset={`${-offset * 2.51}`}
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px]" style={{ color: 'rgba(200,200,230,0.5)' }}>
                  {totalDistortions}
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {distortionDistribution.slice(0, 5).map(([dist, count], i) => {
                const pieColors = [
                  'rgba(255,200,100,0.6)', 'rgba(139,120,255,0.6)', 'rgba(100,180,255,0.6)',
                  'rgba(255,130,130,0.6)', 'rgba(139,220,180,0.6)',
                ];
                const name = DISTORTION_NAMES[dist as CognitiveDistortion];
                const pct = Math.round((count / totalDistortions) * 100);
                return (
                  <div key={dist} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: pieColors[i] }} />
                    <span className="text-[10px] flex-1 truncate" style={{ color: 'rgba(200,200,230,0.5)' }}>
                      {name}
                    </span>
                    <span className="text-[10px]" style={{ color: 'rgba(200,200,230,0.3)' }}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* 洞察提示 */}
          {distortionDistribution.length > 0 && (
            <p className="text-[10px] p-2 rounded-lg" style={{
              background: 'rgba(255,200,100,0.05)',
              color: 'rgba(255,200,100,0.5)',
            }}>
              💡 你最常见的思维模式是「{DISTORTION_NAMES[distortionDistribution[0][0] as CognitiveDistortion]}」
              {distortionDistribution[0][0] === 'catastrophizing' && '，你的大脑很擅长想最坏的情况'}
              {distortionDistribution[0][0] === 'overgeneralization' && '，注意"总是/永远"这样的词汇'}
              {distortionDistribution[0][0] === 'mind-reading' && '，你可能在猜测别人的想法'}
              {distortionDistribution[0][0] === 'should-statements' && '，试着把"应该"换成"想要"'}
            </p>
          )}
        </Section>
      )}

      {/* 👥 角色出场频率 — Phase 2.1 增强（可展开角色卡片）*/}
      {personaDistribution.length > 0 && (
        <Section title="👥 脑内角色">
          <div className="space-y-2">
            {personaDistribution.map(([persona, count]) => {
              const pct = Math.round((count / totalThoughts) * 100);
              return (
                <PersonaCard
                  key={persona}
                  persona={persona as PersonaType}
                  count={count}
                  percentage={pct}
                  expanded={expandedPersona === persona}
                  onClick={() => setExpandedPersona(expandedPersona === persona ? null : persona as PersonaType)}
                />
              );
            })}
          </div>
        </Section>
      )}

      {/* 🎨 情绪分布 */}
      {emotionDistribution.length > 0 && (
        <Section title="🎨 情绪分布">
          <div className="space-y-2">
            {emotionDistribution.map(([emotion, count]) => {
              const colors = EMOTION_COLORS[emotion as EmotionType];
              const name = EMOTION_NAMES[emotion as EmotionType];
              const pct = Math.round((count / totalThoughts) * 100);
              return (
                <div key={emotion} className="flex items-center gap-3">
                  <span className="text-xs w-12" style={{ color: colors.text }}>{name}</span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: colors.glow }}
                    />
                  </div>
                  <span className="text-xs w-8 text-right" style={{ color: 'rgba(200,200,230,0.4)' }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ☁️ 念头词云 — Phase 2.1 新增 */}
      {wordCloud.length > 0 && (
        <Section title="☁️ 念头词云">
          <div className="flex flex-wrap gap-2 justify-center p-3 rounded-xl" style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            {wordCloud.slice(0, 20).map((item, i) => {
              const maxCount = wordCloud[0]?.count || 1;
              const scale = 0.7 + (item.count / maxCount) * 0.8;
              const opacity = 0.3 + (item.count / maxCount) * 0.6;
              const colors = [
                'rgba(139,120,255,', 'rgba(100,180,255,', 'rgba(255,200,100,',
                'rgba(139,220,180,', 'rgba(255,130,130,', 'rgba(200,150,255,',
              ];
              const color = colors[i % colors.length] + opacity + ')';
              return (
                <motion.span
                  key={item.word}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-2 py-1 rounded-full"
                  style={{
                    fontSize: `${Math.max(10, scale * 14)}px`,
                    color,
                    background: color.replace(String(opacity), String(opacity * 0.15)),
                  }}
                >
                  {item.word}
                  {item.count > 1 && (
                    <sup className="text-[8px] ml-0.5" style={{ color: 'rgba(200,200,230,0.3)' }}>
                      {item.count}
                    </sup>
                  )}
                </motion.span>
              );
            })}
          </div>
          {wordCloud.length > 0 && (
            <p className="text-[10px] text-center mt-2" style={{ color: 'rgba(200,200,230,0.3)' }}>
              「{wordCloud[0].word}」是你最常出现的关键词
            </p>
          )}
        </Section>
      )}

      {/* 底部留白 */}
      <div className="h-4" />
    </div>
  );
}

// ===== 子组件 =====

function StatCard({ label, value, emoji }: { label: string; value: number | string; emoji: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-3 rounded-xl text-center"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span className="text-lg block mb-1">{emoji}</span>
      <span className="text-xl font-medium block" style={{ color: 'rgba(230,230,250,0.9)' }}>
        {value}
      </span>
      <span className="text-[10px]" style={{ color: 'rgba(200,200,230,0.4)' }}>
        {label}
      </span>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-medium mb-3" style={{ color: 'rgba(200,200,230,0.5)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ===== 温柔洞察生成（增强版）=====

function generateInsight(thoughts: Array<{ status: string; emotion: string; persona: string; releaseMethod?: string; cognitiveDistortion?: string }>): string | null {
  if (thoughts.length === 0) return null;

  const released = thoughts.filter(t => t.status === 'released');
  const releaseRate = released.length / thoughts.length;

  // 最常见的角色
  const personaCounts: Record<string, number> = {};
  for (const t of thoughts) {
    personaCounts[t.persona] = (personaCounts[t.persona] || 0) + 1;
  }
  const topPersona = Object.entries(personaCounts).sort((a, b) => b[1] - a[1])[0];
  const topPersonaInfo = topPersona ? PERSONA_INFO[topPersona[0] as PersonaType] : null;

  // 最常用的解钩方式
  const methodCounts: Record<string, number> = {};
  for (const t of released) {
    if (t.releaseMethod) {
      methodCounts[t.releaseMethod] = (methodCounts[t.releaseMethod] || 0) + 1;
    }
  }
  const topMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0];

  // 最常见的认知扭曲
  const distortionCounts: Record<string, number> = {};
  for (const t of thoughts) {
    if (t.cognitiveDistortion && t.cognitiveDistortion !== 'unknown') {
      distortionCounts[t.cognitiveDistortion] = (distortionCounts[t.cognitiveDistortion] || 0) + 1;
    }
  }
  const topDistortion = Object.entries(distortionCounts).sort((a, b) => b[1] - a[1])[0];

  const insights: string[] = [];

  if (thoughts.length >= 3 && releaseRate >= 0.5) {
    insights.push(`你已经解钩了 ${released.length} 个念头，做得很好 ✨`);
  }
  if (thoughts.length >= 5 && releaseRate < 0.3) {
    insights.push(`你捕捉了很多念头，试试选择一些释放掉？不需要抓住每一个 🍃`);
  }
  if (topPersonaInfo && topPersona[1] >= 3) {
    insights.push(`${topPersonaInfo.emoji}「${topPersonaInfo.name}」是你最常听到的声音（${topPersona[1]}次），下次它说话时，跟它打个招呼 👋`);
  }
  if (topMethod) {
    const methodNames: Record<string, string> = {
      blow: '吹走', melt: '融化', rewrite: '改写', voice: '变声',
      resize: '缩小', observe: '看见', label: '贴标签', store: '暂存',
    };
    insights.push(`你最擅长的解钩方式是「${methodNames[topMethod[0]] || topMethod[0]}」，试试其他方式可能有新感受 🌱`);
  }
  if (topDistortion && topDistortion[1] >= 2) {
    const distortionName = DISTORTION_NAMES[topDistortion[0] as CognitiveDistortion];
    insights.push(`你的大脑最爱使用「${distortionName}」模式。认识到这一点，就是觉察的开始 🔍`);
  }
  if (thoughts.length >= 10) {
    insights.push(`你已经捕捉了 ${thoughts.length} 个念头。每一次写下来，都是一次对自己的觉察 🌿`);
  }

  if (insights.length === 0) {
    insights.push('每一次写下念头，都是一次对自己的觉察 🌿');
  }

  return insights[Math.floor(Math.random() * insights.length)];
}
