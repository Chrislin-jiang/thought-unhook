/**
 * Zustand Store — Phase 3
 * IndexedDB 持久化 (via Dexie)
 * 新增：主题系统 + 个性化推荐状态 + 分享功能状态
 */

import { create } from 'zustand';
import type { Thought, ReleaseMethod, EmotionType, CognitiveDistortion, PersonaType, DailyStats, PracticeRecord, ThemeType } from './types';
import { classifyThought, rewriteThought, classifyThoughtLLM, rewriteThoughtLLM } from './ai-service';
import { isLLMEnabled } from './llm-client';
import { addThoughtToDB, updateThoughtInDB, getAllThoughts, clearAllThoughts, migrateFromLocalStorage, getSetting, setSetting } from './db';

// ===== Store 定义 =====
interface ThoughtStore {
  thoughts: Thought[];
  selectedThoughtId: string | null;
  isRewriting: boolean;
  rewriteVariants: Array<{ text: string; technique: string; techniqueName: string }> | null;
  isLoading: boolean;
  onboardingCompleted: boolean;
  currentPage: 'space' | 'journal' | 'night' | 'lab';

  // Phase 2.1: 角色昵称
  personaNicknames: Record<string, string>;

  // Phase 2.1: 练习记录
  practiceRecords: PracticeRecord[];

  // Phase 3: 主题
  currentTheme: ThemeType;

  // Phase 3: 分享面板
  showSharePanel: boolean;

  // 初始化
  init: () => Promise<void>;

  // 念头操作
  addThought: (content: string) => Promise<Thought>;
  selectThought: (id: string | null) => void;
  releaseThought: (id: string, method: ReleaseMethod) => void;
  storeThought: (id: string) => void;
  setRewritten: (id: string, content: string) => void;
  requestRewrite: (id: string) => void;
  clearRewrite: () => void;
  addTagToThought: (id: string, tag: string) => void;
  clearAll: () => Promise<void>;

  // 页面导航
  setPage: (page: 'space' | 'journal' | 'night' | 'lab') => void;
  setOnboardingCompleted: (completed: boolean) => void;

  // Phase 2.1: 角色昵称
  setPersonaNickname: (persona: PersonaType, nickname: string) => void;
  getPersonaNickname: (persona: PersonaType) => string | undefined;

  // Phase 2.1: 练习记录
  addPracticeRecord: (record: PracticeRecord) => void;

  // Phase 3: 主题
  setTheme: (theme: ThemeType) => void;

  // Phase 3: 分享面板
  setShowSharePanel: (show: boolean) => void;

  // Phase 3: 方法使用统计（用于推荐算法）
  getMethodStats: () => Record<ReleaseMethod, number>;

  // 统计
  getActiveThoughts: () => Thought[];
  getStoredThoughts: () => Thought[];
  getReleasedThoughts: () => Thought[];
  getTodayCount: () => number;
  getTodayThoughts: () => Thought[];
  getDailyStats: (days?: number) => DailyStats[];
  getPersonaStats: () => Array<{ persona: PersonaType; count: number; percentage: number }>;
  getDistortionStats: () => Array<{ distortion: CognitiveDistortion; count: number; percentage: number }>;
  getWordCloud: () => Array<{ word: string; count: number }>;
  getStreak: () => number;
}

let idCounter = Date.now();

export const useThoughtStore = create<ThoughtStore>((set, get) => ({
  thoughts: [],
  selectedThoughtId: null,
  isRewriting: false,
  rewriteVariants: null,
  isLoading: true,
  onboardingCompleted: false,
  currentPage: 'space',
  personaNicknames: {},
  practiceRecords: [],
  currentTheme: 'starry' as ThemeType,
  showSharePanel: false,

  init: async () => {
    // 从 localStorage 迁移到 IndexedDB
    await migrateFromLocalStorage();

    // 从 IndexedDB 加载数据
    const thoughts = await getAllThoughts();
    
    // 检查 onboarding 状态
    const onboardingDone = localStorage.getItem('thought-unhook-onboarding') === 'true';

    // 加载角色昵称
    const nicknames = await getSetting<Record<string, string>>('persona-nicknames', {});

    // 加载练习记录
    const records = await getSetting<PracticeRecord[]>('practice-records', []);

    // Phase 3: 加载主题
    const theme = await getSetting<ThemeType>('current-theme', 'starry');

    set({ 
      thoughts, 
      isLoading: false, 
      onboardingCompleted: onboardingDone,
      personaNicknames: nicknames,
      practiceRecords: records,
      currentTheme: theme,
    });
  },

  addThought: async (content: string) => {
    const uid = String(++idCounter);

    // 先用本地规则快速分类（同步，零延迟）
    const classification = classifyThought(content);
    const thought: Thought = {
      uid,
      content,
      createdAt: Date.now(),
      emotion: classification.emotion,
      intensity: classification.intensity,
      stickiness: Math.min(10, classification.intensity + Math.floor(Math.random() * 3)),
      cognitiveDistortion: classification.cognitiveDistortion,
      persona: classification.persona,
      tags: classification.tags || [],
      status: 'active',
      recurrenceCount: 0,
    };

    // 保存到 IndexedDB
    const dbId = await addThoughtToDB(thought);
    thought.id = dbId;

    // 立即更新 UI
    set(state => ({
      thoughts: [thought, ...state.thoughts],
    }));

    // 异步 LLM 增强分类（不阻塞 UI）
    if (isLLMEnabled()) {
      classifyThoughtLLM(content).then(llmResult => {
        const updates = {
          emotion: llmResult.emotion,
          intensity: llmResult.intensity,
          cognitiveDistortion: llmResult.cognitiveDistortion,
          persona: llmResult.persona,
          tags: llmResult.tags.length > 0 ? llmResult.tags : classification.tags,
        };
        set(state => ({
          thoughts: state.thoughts.map(t =>
            t.uid === uid ? { ...t, ...updates } : t
          ),
        }));
        updateThoughtInDB(uid, updates);
      }).catch(() => { /* 静默失败，本地结果已可用 */ });
    }

    return thought;
  },

  selectThought: (id) => {
    set({ selectedThoughtId: id, rewriteVariants: null, isRewriting: false });
  },

  releaseThought: (id, method) => {
    set(state => {
      const newThoughts = state.thoughts.map(t =>
        t.uid === id
          ? { ...t, status: 'released' as const, releasedAt: Date.now(), releaseMethod: method }
          : t
      );
      // 异步更新 DB
      updateThoughtInDB(id, { status: 'released', releasedAt: Date.now(), releaseMethod: method });
      return {
        thoughts: newThoughts,
        selectedThoughtId: state.selectedThoughtId === id ? null : state.selectedThoughtId,
        rewriteVariants: null,
      };
    });
  },

  storeThought: (id) => {
    set(state => {
      const newThoughts = state.thoughts.map(t =>
        t.uid === id
          ? { ...t, status: 'stored' as const }
          : t
      );
      updateThoughtInDB(id, { status: 'stored' });
      return {
        thoughts: newThoughts,
        selectedThoughtId: state.selectedThoughtId === id ? null : state.selectedThoughtId,
        rewriteVariants: null,
      };
    });
  },

  setRewritten: (id, content) => {
    set(state => {
      const newThoughts = state.thoughts.map(t =>
        t.uid === id ? { ...t, rewrittenContent: content } : t
      );
      updateThoughtInDB(id, { rewrittenContent: content });
      return { thoughts: newThoughts };
    });
  },

  requestRewrite: (id) => {
    const thought = get().thoughts.find(t => t.uid === id);
    if (!thought) return;

    set({ isRewriting: true });

    if (isLLMEnabled()) {
      // LLM 优先改写
      rewriteThoughtLLM(thought.content, thought.emotion, thought.cognitiveDistortion)
        .then(result => {
          console.log('[Rewrite] LLM success, variants:', result.variants.length);
          set({
            isRewriting: false,
            rewriteVariants: result.variants,
          });
        })
        .catch((err) => {
          console.warn('[Rewrite] LLM failed, falling back to local:', err?.message || err);
          const result = rewriteThought(thought.content);
          set({
            isRewriting: false,
            rewriteVariants: result.variants,
          });
        });
    } else {
      // 本地模板改写（带模拟延迟）
      setTimeout(() => {
        const result = rewriteThought(thought.content);
        set({
          isRewriting: false,
          rewriteVariants: result.variants,
        });
      }, 600);
    }
  },

  clearRewrite: () => {
    set({ rewriteVariants: null, isRewriting: false });
  },

  addTagToThought: (id, tag) => {
    set(state => {
      const newThoughts = state.thoughts.map(t =>
        t.uid === id ? { ...t, tags: [...(t.tags || []), tag] } : t
      );
      const thought = newThoughts.find(t => t.uid === id);
      if (thought) {
        updateThoughtInDB(id, { tags: thought.tags });
      }
      return { thoughts: newThoughts };
    });
  },

  clearAll: async () => {
    await clearAllThoughts();
    set({ thoughts: [], selectedThoughtId: null, rewriteVariants: null });
  },

  setPage: (page) => set({ currentPage: page }),

  setOnboardingCompleted: (completed) => {
    localStorage.setItem('thought-unhook-onboarding', String(completed));
    set({ onboardingCompleted: completed });
  },

  // Phase 2.1: 角色昵称
  setPersonaNickname: (persona, nickname) => {
    set(state => {
      const newNicknames = { ...state.personaNicknames, [persona]: nickname };
      setSetting('persona-nicknames', newNicknames);
      return { personaNicknames: newNicknames };
    });
  },

  getPersonaNickname: (persona) => {
    return get().personaNicknames[persona];
  },

  // Phase 2.1: 练习记录
  addPracticeRecord: (record) => {
    set(state => {
      const newRecords = [record, ...state.practiceRecords];
      setSetting('practice-records', newRecords);
      return { practiceRecords: newRecords };
    });
  },

  // Phase 3: 主题切换
  setTheme: (theme) => {
    setSetting('current-theme', theme);
    set({ currentTheme: theme });
  },

  // Phase 3: 分享面板
  setShowSharePanel: (show) => set({ showSharePanel: show }),

  // Phase 3: 方法使用统计
  getMethodStats: () => {
    const thoughts = get().thoughts.filter(t => t.status === 'released' && t.releaseMethod);
    const stats: Record<ReleaseMethod, number> = {
      observe: 0, label: 0, rewrite: 0, voice: 0,
      resize: 0, blow: 0, melt: 0, store: 0,
    };
    for (const t of thoughts) {
      if (t.releaseMethod) {
        stats[t.releaseMethod] = (stats[t.releaseMethod] || 0) + 1;
      }
    }
    return stats;
  },

  getActiveThoughts: () => {
    return get().thoughts.filter(t => t.status === 'active');
  },

  getStoredThoughts: () => {
    return get().thoughts.filter(t => t.status === 'stored');
  },

  getReleasedThoughts: () => {
    return get().thoughts.filter(t => t.status === 'released');
  },

  getTodayCount: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    return get().thoughts.filter(t => t.createdAt >= todayStart).length;
  },

  // Phase 3: 获取今日念头
  getTodayThoughts: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    return get().thoughts.filter(t => t.createdAt >= todayStart);
  },

  // Phase 2.1: 角色出场统计
  getPersonaStats: () => {
    const thoughts = get().thoughts;
    const counts: Record<string, number> = {};
    for (const t of thoughts) {
      counts[t.persona] = (counts[t.persona] || 0) + 1;
    }
    const total = thoughts.length || 1;
    return Object.entries(counts)
      .map(([persona, count]) => ({
        persona: persona as PersonaType,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  },

  // Phase 2.1: 认知扭曲分布统计
  getDistortionStats: () => {
    const thoughts = get().thoughts.filter(t => t.cognitiveDistortion !== 'unknown');
    const counts: Record<string, number> = {};
    for (const t of thoughts) {
      counts[t.cognitiveDistortion] = (counts[t.cognitiveDistortion] || 0) + 1;
    }
    const total = thoughts.length || 1;
    return Object.entries(counts)
      .map(([distortion, count]) => ({
        distortion: distortion as CognitiveDistortion,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  },

  // Phase 2.1: 念头词云
  getWordCloud: () => {
    const thoughts = get().thoughts;
    const wordCounts: Record<string, number> = {};
    
    // 提取关键词
    const stopWords = new Set(['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '那', '这', '它', '把', '被', '让', '给', '吗', '呢', '吧', '啊', '哦', '嗯']);
    
    for (const t of thoughts) {
      // 简单分词：按标点和空格分割，然后提取2-4字词组
      const text = t.content;
      // 提取 2-4 字的连续中文
      const words = text.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
      for (const word of words) {
        if (!stopWords.has(word)) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      }
    }

    return Object.entries(wordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);
  },

  getDailyStats: (days = 7) => {
    const thoughts = get().thoughts;
    const stats: DailyStats[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dayStart = date.getTime();
      const dayEnd = dayStart + 86400000;
      const dateStr = date.toISOString().split('T')[0];

      const dayThoughts = thoughts.filter(t => t.createdAt >= dayStart && t.createdAt < dayEnd);

      const emotions = {} as Record<EmotionType, number>;
      const distortions = {} as Record<CognitiveDistortion, number>;
      const personas = {} as Record<PersonaType, number>;
      const methods = {} as Record<ReleaseMethod, number>;

      for (const t of dayThoughts) {
        emotions[t.emotion] = (emotions[t.emotion] || 0) + 1;
        distortions[t.cognitiveDistortion] = (distortions[t.cognitiveDistortion] || 0) + 1;
        personas[t.persona] = (personas[t.persona] || 0) + 1;
        if (t.releaseMethod) {
          methods[t.releaseMethod] = (methods[t.releaseMethod] || 0) + 1;
        }
      }

      stats.push({
        date: dateStr,
        thoughtCount: dayThoughts.length,
        releasedCount: dayThoughts.filter(t => t.status === 'released').length,
        storedCount: dayThoughts.filter(t => t.status === 'stored').length,
        emotions,
        distortions,
        personas,
        methods,
      });
    }

    return stats;
  },

  // Phase 3: 连续使用天数
  getStreak: () => {
    const thoughts = get().thoughts;
    if (thoughts.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const dayStart = today.getTime() - i * 86400000;
      const dayEnd = dayStart + 86400000;
      const hasThoughts = thoughts.some(t => t.createdAt >= dayStart && t.createdAt < dayEnd);
      if (hasThoughts) {
        streak++;
      } else if (i > 0) {
        break; // 中断了
      }
    }
    return streak;
  },
}));
