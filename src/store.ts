/**
 * Zustand Store — Phase 0
 * localStorage 持久化
 */

import { create } from 'zustand';
import type { Thought, ReleaseMethod } from './types';
import { classifyThought, rewriteThought } from './ai-service';

// ===== localStorage helpers =====
const STORAGE_KEY = 'thought-unhook-data';

function loadThoughts(): Thought[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}

function saveThoughts(thoughts: Thought[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts));
  } catch {
    // ignore
  }
}

// ===== Store 定义 =====
interface ThoughtStore {
  thoughts: Thought[];
  selectedThoughtId: string | null;
  isRewriting: boolean;
  rewriteVariants: Array<{ text: string; technique: string; techniqueName: string }> | null;

  // 操作
  addThought: (content: string) => Thought;
  selectThought: (id: string | null) => void;
  releaseThought: (id: string, method: ReleaseMethod) => void;
  setRewritten: (id: string, content: string) => void;
  requestRewrite: (id: string) => void;
  clearRewrite: () => void;
  clearAll: () => void;

  // 统计
  getActiveThoughts: () => Thought[];
  getReleasedThoughts: () => Thought[];
  getTodayCount: () => number;
}

let idCounter = Date.now();

export const useThoughtStore = create<ThoughtStore>((set, get) => ({
  thoughts: loadThoughts(),
  selectedThoughtId: null,
  isRewriting: false,
  rewriteVariants: null,

  addThought: (content: string) => {
    const classification = classifyThought(content);
    const thought: Thought = {
      id: String(++idCounter),
      content,
      createdAt: Date.now(),
      emotion: classification.emotion,
      intensity: classification.intensity,
      cognitiveDistortion: classification.cognitiveDistortion,
      persona: classification.persona,
      status: 'active',
    };

    set(state => {
      const newThoughts = [thought, ...state.thoughts];
      saveThoughts(newThoughts);
      return { thoughts: newThoughts };
    });

    return thought;
  },

  selectThought: (id) => {
    set({ selectedThoughtId: id, rewriteVariants: null, isRewriting: false });
  },

  releaseThought: (id, method) => {
    set(state => {
      const newThoughts = state.thoughts.map(t =>
        t.id === id
          ? { ...t, status: 'released' as const, releasedAt: Date.now(), releaseMethod: method }
          : t
      );
      saveThoughts(newThoughts);
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
        t.id === id ? { ...t, rewrittenContent: content } : t
      );
      saveThoughts(newThoughts);
      return { thoughts: newThoughts };
    });
  },

  requestRewrite: (id) => {
    const thought = get().thoughts.find(t => t.id === id);
    if (!thought) return;

    set({ isRewriting: true });

    // 模拟一小段延迟，增加"AI分析中"的感觉
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

  clearAll: () => {
    set({ thoughts: [], selectedThoughtId: null, rewriteVariants: null });
    localStorage.removeItem(STORAGE_KEY);
  },

  getActiveThoughts: () => {
    return get().thoughts.filter(t => t.status === 'active');
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
}));
