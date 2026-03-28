/**
 * IndexedDB 数据库 — Phase 1
 * 使用 Dexie.js 封装 IndexedDB
 */

import Dexie, { type Table } from 'dexie';
import type { Thought, EmotionType, CognitiveDistortion, PersonaType, ReleaseMethod } from './types';

// 数据库定义
class OffStageDB extends Dexie {
  thoughts!: Table<Thought, number>;
  settings!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super('OffStageDB');
    this.version(1).stores({
      thoughts: '++id, uid, createdAt, status, emotion, persona, cognitiveDistortion',
      settings: 'key',
    });
  }
}

const db = new OffStageDB();

export { db };

// ===== 念头操作 =====

export async function addThoughtToDB(thought: Omit<Thought, 'id'>): Promise<number> {
  return await db.thoughts.add(thought as Thought) as number;
}

export async function updateThoughtInDB(uid: string, changes: Partial<Thought>): Promise<void> {
  const existing = await db.thoughts.where('uid').equals(uid).first();
  if (existing?.id) {
    await db.thoughts.update(existing.id, changes);
  }
}

export async function getAllThoughts(): Promise<Thought[]> {
  return await db.thoughts.orderBy('createdAt').reverse().toArray();
}

export async function getActiveThoughts(): Promise<Thought[]> {
  return await db.thoughts.where('status').equals('active').reverse().sortBy('createdAt');
}

export async function getStoredThoughts(): Promise<Thought[]> {
  return await db.thoughts.where('status').equals('stored').reverse().sortBy('createdAt');
}

export async function getThoughtsByDateRange(start: number, end: number): Promise<Thought[]> {
  return await db.thoughts
    .where('createdAt')
    .between(start, end)
    .toArray();
}

export async function clearAllThoughts(): Promise<void> {
  await db.thoughts.clear();
}

// ===== 设置操作 =====

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const record = await db.settings.get(key);
  return record ? (record.value as T) : defaultValue;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value });
}

// ===== 迁移: localStorage → IndexedDB =====

export async function migrateFromLocalStorage(): Promise<boolean> {
  // 先迁移旧品牌的 IndexedDB 数据
  await migrateFromOldDB();

  const STORAGE_KEY = 'offstage-data';
  const OLD_STORAGE_KEY = 'thought-unhook-data';
  try {
    // 兼容旧键名
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY);
    if (!raw) return false;
    
    const oldThoughts = JSON.parse(raw);
    if (!Array.isArray(oldThoughts) || oldThoughts.length === 0) return false;

    // 检查是否已经迁移过
    const existingCount = await db.thoughts.count();
    if (existingCount > 0) return false;

    // 迁移数据
    const migrated: Omit<Thought, 'id'>[] = oldThoughts.map((t: Record<string, unknown>) => ({
      uid: t.id as string,
      content: t.content as string,
      rewrittenContent: t.rewrittenContent as string | undefined,
      createdAt: t.createdAt as number,
      emotion: (t.emotion || 'neutral') as EmotionType,
      intensity: (t.intensity as number) || 5,
      stickiness: (t.intensity as number) || 5,
      cognitiveDistortion: (t.cognitiveDistortion || 'unknown') as CognitiveDistortion,
      persona: (t.persona || 'anxiety-monster') as PersonaType,
      tags: [] as string[],
      status: (t.status || 'active') as 'active' | 'stored' | 'released',
      releasedAt: t.releasedAt as number | undefined,
      releaseMethod: t.releaseMethod as ReleaseMethod | undefined,
      recurrenceCount: 0,
    }));

    await db.thoughts.bulkAdd(migrated as Thought[]);
    
    // 清理旧数据
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OLD_STORAGE_KEY);
    
    return true;
  } catch {
    return false;
  }
}

// ===== 迁移: 旧品牌 IndexedDB (ThoughtUnhookDB) → 新品牌 (OffStageDB) =====

async function migrateFromOldDB(): Promise<void> {
  const OLD_DB_NAME = 'ThoughtUnhookDB';
  try {
    // 检查旧数据库是否存在
    const databases = await Dexie.getDatabaseNames();
    if (!databases.includes(OLD_DB_NAME)) return;

    // 新数据库已有数据则跳过
    const newCount = await db.thoughts.count();
    if (newCount > 0) {
      // 已有数据，删除旧库
      await Dexie.delete(OLD_DB_NAME);
      return;
    }

    // 打开旧数据库读取数据
    const oldDb = new Dexie(OLD_DB_NAME);
    oldDb.version(1).stores({
      thoughts: '++id, uid, createdAt, status, emotion, persona, cognitiveDistortion',
      settings: 'key',
    });

    const oldThoughts = await oldDb.table('thoughts').toArray();
    const oldSettings = await oldDb.table('settings').toArray();

    // 写入新数据库
    if (oldThoughts.length > 0) {
      await db.thoughts.bulkAdd(oldThoughts);
    }
    if (oldSettings.length > 0) {
      await db.settings.bulkPut(oldSettings);
    }

    oldDb.close();
    await Dexie.delete(OLD_DB_NAME);

    // 迁移 localStorage 键名
    const onboarding = localStorage.getItem('thought-unhook-onboarding');
    if (onboarding !== null) {
      localStorage.setItem('offstage-onboarding', onboarding);
      localStorage.removeItem('thought-unhook-onboarding');
    }

    const llmConfig = localStorage.getItem('thought-unhook-llm-config');
    if (llmConfig !== null) {
      localStorage.setItem('offstage-llm-config', llmConfig);
      localStorage.removeItem('thought-unhook-llm-config');
    }
  } catch {
    // 静默失败，不影响新用户体验
  }
}
