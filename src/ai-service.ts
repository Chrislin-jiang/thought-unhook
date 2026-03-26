/**
 * AI 服务 — Phase 1 MVP
 * 
 * v0.1: 基于关键词匹配的本地分析 + 模板化改写（零成本）
 * 将来可升级为 OpenAI API 调用
 */

import type {
  EmotionType,
  CognitiveDistortion,
  PersonaType,
} from './types';

// ===== Layer 1: 念头识别与分类（关键词匹配版）=====

interface ClassifyResult {
  emotion: EmotionType;
  cognitiveDistortion: CognitiveDistortion;
  persona: PersonaType;
  intensity: number;
  tags: string[];
}

// 关键词规则库
const EMOTION_KEYWORDS: Array<{ keywords: string[]; emotion: EmotionType; weight: number }> = [
  { keywords: ['担心', '焦虑', '不安', '紧张', '害怕', '恐惧', '万一', '怎么办'], emotion: 'anxiety', weight: 2 },
  { keywords: ['生气', '愤怒', '烦', '讨厌', '受不了', '气死', '凭什么'], emotion: 'anger', weight: 2 },
  { keywords: ['难过', '伤心', '悲', '哭', '失去', '孤独', '寂寞', '想念'], emotion: 'sadness', weight: 2 },
  { keywords: ['怕', '恐惧', '害怕', '吓', '可怕', '不敢'], emotion: 'fear', weight: 2 },
  { keywords: ['内疚', '对不起', '愧疚', '错', '道歉', '抱歉', '我的错'], emotion: 'guilt', weight: 2 },
  { keywords: ['丢脸', '羞耻', '丢人', '尴尬', '没脸', '笑话'], emotion: 'shame', weight: 2 },
  { keywords: ['失败', '做不好', '不够好', '不行', '完了', '糟糕', '完蛋'], emotion: 'anxiety', weight: 1 },
  { keywords: ['应该', '必须', '一定要', '不能不'], emotion: 'guilt', weight: 1 },
];

const DISTORTION_PATTERNS: Array<{ patterns: RegExp[]; distortion: CognitiveDistortion }> = [
  { patterns: [/肯定会.*失败/, /一定会.*糟/, /完了/, /完蛋/, /没救/], distortion: 'catastrophizing' },
  { patterns: [/什么都/, /永远/, /从来/, /总是/, /一直/, /每次都/], distortion: 'overgeneralization' },
  { patterns: [/他.*觉得/, /她.*觉得/, /他们.*认为/, /别人.*看/, /讨厌我/, /不喜欢我/], distortion: 'mind-reading' },
  { patterns: [/应该/, /必须/, /不得不/, /一定要/], distortion: 'should-statements' },
  { patterns: [/都是我的错/, /全怪我/, /因为我/], distortion: 'personalization' },
  { patterns: [/要么.*要么/, /不是.*就是/, /只有.*才/, /如果不.*就/], distortion: 'black-white' },
  { patterns: [/我觉得.*所以/, /感觉.*肯定/], distortion: 'emotional-reasoning' },
  { patterns: [/肯定会/, /一定会/, /注定/, /命中/], distortion: 'fortune-telling' },
  { patterns: [/我就是.*笨/, /我就是.*差/, /我是个.*人/], distortion: 'labeling' },
  { patterns: [/不算什么/, /只是运气/, /任何人都能/, /没什么大不了/], distortion: 'discounting-positive' },
];

const PERSONA_MAPPING: Record<CognitiveDistortion, PersonaType> = {
  'catastrophizing': 'fortune-teller',
  'overgeneralization': 'judge',
  'mind-reading': 'performer',
  'should-statements': 'perfectionist-ai',
  'personalization': 'judge',
  'black-white': 'perfectionist-ai',
  'emotional-reasoning': 'inner-child',
  'fortune-telling': 'fortune-teller',
  'labeling': 'judge',
  'discounting-positive': 'perfectionist-ai',
  'unknown': 'anxiety-monster',
};

// 标签提取关键词
const TAG_KEYWORDS: Array<{ keywords: string[]; tag: string }> = [
  { keywords: ['工作', '项目', '任务', '会议', '同事', '领导', '老板', '需求', '加班'], tag: '工作' },
  { keywords: ['考试', '学习', '成绩', '分数', '作业', '论文'], tag: '学习' },
  { keywords: ['朋友', '他', '她', '社交', '关系', '感情', '恋爱', '对象'], tag: '人际' },
  { keywords: ['钱', '经济', '房', '贷', '工资', '花费'], tag: '经济' },
  { keywords: ['健康', '身体', '病', '医', '睡', '累', '疲'], tag: '健康' },
  { keywords: ['未来', '将来', '明天', '以后', '前途'], tag: '未来' },
  { keywords: ['过去', '后悔', '曾经', '当初', '那时'], tag: '过去' },
  { keywords: ['自己', '自我', '不够', '配不上', '不值得'], tag: '自我价值' },
];

export function classifyThought(content: string): ClassifyResult {
  // 1. 检测情绪
  const emotionScores: Partial<Record<EmotionType, number>> = {};
  for (const rule of EMOTION_KEYWORDS) {
    for (const keyword of rule.keywords) {
      if (content.includes(keyword)) {
        const prev = emotionScores[rule.emotion] || 0;
        emotionScores[rule.emotion] = prev + rule.weight;
      }
    }
  }

  let emotion: EmotionType = 'neutral';
  let maxScore = 0;
  for (const [emo, score] of Object.entries(emotionScores)) {
    if (score > maxScore) {
      maxScore = score;
      emotion = emo as EmotionType;
    }
  }

  // 多种情绪同时存在时标记为mixed
  const significantEmotions = Object.values(emotionScores).filter(s => s >= 2);
  if (significantEmotions.length > 1) {
    emotion = 'mixed';
  }

  // 2. 检测认知扭曲
  let cognitiveDistortion: CognitiveDistortion = 'unknown';
  for (const rule of DISTORTION_PATTERNS) {
    for (const pattern of rule.patterns) {
      if (pattern.test(content)) {
        cognitiveDistortion = rule.distortion;
        break;
      }
    }
    if (cognitiveDistortion !== 'unknown') break;
  }

  // 3. 分配内在角色
  const persona = PERSONA_MAPPING[cognitiveDistortion];

  // 4. 估算强度
  let intensity = 5;
  if (content.includes('!') || content.includes('！')) intensity += 1;
  if (content.length > 20) intensity += 1;
  if (maxScore >= 3) intensity += 1;
  if (maxScore >= 5) intensity += 1;
  intensity = Math.min(10, Math.max(1, intensity));

  // 5. 提取标签
  const tags: string[] = [];
  for (const rule of TAG_KEYWORDS) {
    for (const keyword of rule.keywords) {
      if (content.includes(keyword) && !tags.includes(rule.tag)) {
        tags.push(rule.tag);
        break;
      }
    }
  }

  return { emotion, cognitiveDistortion, persona, intensity, tags };
}

// ===== Layer 2: 自动解钩改写（模板版）=====

interface RewriteResult {
  variants: Array<{
    text: string;
    technique: string;
    techniqueName: string;
  }>;
}

export function rewriteThought(content: string): RewriteResult {
  const cleaned = content.replace(/[。！？!?.]+$/, '');

  return {
    variants: [
      {
        text: `我注意到我在想：「${cleaned}」`,
        technique: 'awareness-prefix',
        techniqueName: '觉察前缀',
      },
      {
        text: `我正在产生一个想法：「${cleaned}」`,
        technique: 'objectification',
        techniqueName: '客体化',
      },
      {
        text: `我的大脑在告诉我一个故事：「${cleaned}」`,
        technique: 'narrative',
        techniqueName: '叙事化',
      },
      {
        text: `「${cleaned}」这个念头又来了，像个老朋友`,
        technique: 'personification',
        techniqueName: '拟人化',
      },
    ],
  };
}

// ===== 自动标签生成 =====

export function generateLabel(content: string, emotion: EmotionType, distortion: CognitiveDistortion): string {
  const emotionMap: Record<string, string> = {
    anxiety: '未来的担忧', anger: '愤怒', sadness: '悲伤',
    fear: '恐惧', guilt: '内疚', shame: '羞耻', neutral: '日常想法', mixed: '复杂情绪',
  };
  const distortionMap: Record<string, string> = {
    catastrophizing: '灾难化', overgeneralization: '过度概括', 'mind-reading': '揣测他人',
    'should-statements': '应该思维', personalization: '自我归因', 'black-white': '极端化',
    'emotional-reasoning': '情绪推理', 'fortune-telling': '预测未来', labeling: '自我标签',
    'discounting-positive': '否定积极', unknown: '',
  };

  const emo = emotionMap[emotion] || '想法';
  const dist = distortionMap[distortion];
  
  return dist ? `这是一个关于「${emo}」的${dist}念头` : `这是一个关于「${emo}」的念头`;
}

// ===== TTS 变声（Web Speech API）=====

export interface VoiceOption {
  id: string;
  name: string;
  emoji: string;
  rate: number;
  pitch: number;
}

export const FUNNY_VOICES: VoiceOption[] = [
  { id: 'chipmunk', name: '花栗鼠', emoji: '🐿️', rate: 1.8, pitch: 2 },
  { id: 'slow', name: '超级慢速', emoji: '🐌', rate: 0.4, pitch: 0.8 },
  { id: 'robot', name: '机器人', emoji: '🤖', rate: 1.0, pitch: 0.1 },
  { id: 'dramatic', name: '浮夸播报', emoji: '📢', rate: 0.7, pitch: 1.5 },
];

export function speakThought(content: string, voice: VoiceOption): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('浏览器不支持语音合成'));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = 'zh-CN';
    utterance.rate = voice.rate;
    utterance.pitch = voice.pitch;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.startsWith('zh'));
    if (zhVoice) {
      utterance.voice = zhVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
  });
}

export function preloadVoices(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
  }
}
