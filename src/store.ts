/**
 * Zustand Store — Phase 1
 * IndexedDB 持久化 (via Dexie)
 */

import { create } from 'zustand';
import type { Thought, ReleaseMethod, EmotionType, CognitiveDistortion, PersonaType, DailyStats } from './types';
import { classifyThought, rewriteThought } from './ai-service';
import { addThoughtToDB, updateThoughtInDB, getAllThoughts, clearAllThoughts, migrateFromLocalStorage } from './db';

// ===== Store 定义 =====
interface ThoughtStore {
  thoughts: Thought[];
  selectedThoughtId: string | null;
  isRewriting: boolean;
  rewriteVariants: Array<{ text: string; technique: string; techniqueName: string }> | null;
  isLoading: boolean;
  onboardingCompleted: boolean;
  currentPage: 'space' | 'journal' | 'night';

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
  setPage: (page: 'space' | 'journal' | 'night') => void;
  setOnboardingCompleted: (completed: boolean) => void;

  // 统计
  getActiveThoughts: () => Thought[];
  getStoredThoughts: () => Thought[];
  getReleasedThoughts: () => Thought[];
  getTodayCount: () => number;
  getDailyStats: (days?: number) => DailyStats[];
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

  init: async () => {
    // 从 localStorage 迁移到 IndexedDB
    await migrateFromLocalStorage();

    // 从 IndexedDB 加载数据
    const thoughts = await getAllThoughts();
    
    // 检查 onboarding 状态
    const onboardingDone = localStorage.getItem('thought-unhook-onboarding') === 'true';

    set({ thoughts, isLoading: false, onboardingCompleted: onboardingDone });
  },

  addThought: async (content: string) => {
    const classification = classifyThought(content);
    const thought: Thought = {
      uid: String(++idCounter),
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

    set(state => ({
      thoughts: [thought, ...state.thoughts],
    }));

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

    setTimeout(() => {
      const result = rewriteThought(thought.content);
      set({
        isRewriting: false,
        rewriteVariants: result.variants,
      });
    }, 600);
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
}));
