/**
 * 戏精猫 — 出戏 OffStage 应用陪伴形象 v2
 * 
 * 风格：OtterLife 海獭同款 blob 圆润可爱风
 * - 头身一体的水滴/豆子形
 * - 小短手小短脚
 * - 深蓝紫渐变 + 浅色肚皮
 * - 圆圆的大眼 + 粉腮红
 * - 小面具配饰
 */

import { motion } from 'framer-motion';

export type MascotMood = 'default' | 'happy' | 'sleepy' | 'thinking' | 'waving' | 'meditation' | 'peek';
export type MascotSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface MascotProps {
  mood?: MascotMood;
  size?: MascotSize;
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP: Record<MascotSize, number> = {
  xs: 48,
  sm: 72,
  md: 120,
  lg: 180,
  xl: 260,
};

export default function Mascot({
  mood = 'default',
  size = 'md',
  animate = true,
  className = '',
  style = {},
}: MascotProps) {
  const px = SIZE_MAP[size];

  return (
    <motion.div
      className={className}
      style={{ width: px, height: px, ...style }}
      animate={animate ? { y: [0, -6, 0] } : undefined}
      transition={animate ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          {/* 主体渐变 — 深蓝紫，参考海獭的深色 */}
          <linearGradient id="bodyG" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#6B5DD8" />
            <stop offset="100%" stopColor="#4F42B5" />
          </linearGradient>
          {/* 身体高光 */}
          <radialGradient id="bodyHL" cx="35%" cy="25%" r="55%">
            <stop offset="0%" stopColor="#9B8EF5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#9B8EF5" stopOpacity="0" />
          </radialGradient>
          {/* 肚皮 */}
          <radialGradient id="bellyG" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#EDE9FE" />
            <stop offset="100%" stopColor="#D8D0F8" />
          </radialGradient>
          {/* 腮红 */}
          <radialGradient id="blushG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF8FAB" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF8FAB" stopOpacity="0" />
          </radialGradient>
          {/* 面具 */}
          <linearGradient id="maskG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ECDC4" />
            <stop offset="100%" stopColor="#3BB8B0" />
          </linearGradient>
          {/* 星星 */}
          <linearGradient id="starG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFB36B" />
          </linearGradient>
          {/* 柔和阴影 */}
          <filter id="shd" x="-15%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#4F42B5" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* ===== 地面阴影 ===== */}
        <ellipse cx="100" cy="186" rx="38" ry="6" fill="#4F42B5" opacity="0.1" />

        {/* ===== 尾巴 — 从身体右后探出的小卷 ===== */}
        <motion.path
          d="M 138 140 Q 158 130, 160 112 Q 161 100, 154 96"
          stroke="url(#bodyG)"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
          animate={animate ? {
            d: [
              'M 138 140 Q 158 130, 160 112 Q 161 100, 154 96',
              'M 138 140 Q 162 126, 164 110 Q 166 96, 156 90',
              'M 138 140 Q 158 130, 160 112 Q 161 100, 154 96',
            ],
          } : undefined}
          transition={animate ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : undefined}
        />

        {/* ===== 主体 — blob 豆子形（头身一体）===== */}
        <path
          d="M 100 30 
             C 145 30, 158 60, 158 95 
             C 158 135, 145 170, 120 178 
             Q 100 185, 80 178 
             C 55 170, 42 135, 42 95 
             C 42 60, 55 30, 100 30Z"
          fill="url(#bodyG)"
          filter="url(#shd)"
        />
        {/* 高光层 */}
        <path
          d="M 100 30 
             C 145 30, 158 60, 158 95 
             C 158 135, 145 170, 120 178 
             Q 100 185, 80 178 
             C 55 170, 42 135, 42 95 
             C 42 60, 55 30, 100 30Z"
          fill="url(#bodyHL)"
        />

        {/* ===== 肚皮 — 浅色椭圆 ===== */}
        <ellipse cx="100" cy="130" rx="32" ry="38" fill="url(#bellyG)" opacity="0.85" />

        {/* ===== 小短脚 ===== */}
        <ellipse cx="80" cy="176" rx="13" ry="7" fill="#4A3DAF" />
        <ellipse cx="120" cy="176" rx="13" ry="7" fill="#4A3DAF" />
        {/* 脚上的肉垫 */}
        <ellipse cx="80" cy="175" rx="7" ry="4" fill="#D8D0F8" opacity="0.5" />
        <ellipse cx="120" cy="175" rx="7" ry="4" fill="#D8D0F8" opacity="0.5" />

        {/* ===== 小短手 ===== */}
        <MascotArms mood={mood} animate={animate} />

        {/* ===== 猫耳 — 圆润三角 ===== */}
        <path d="M 62 55 Q 55 22, 72 42" fill="#6B5DD8" stroke="#6B5DD8" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 64 52 Q 59 30, 71 44" fill="#FF8FAB" opacity="0.45" />
        <path d="M 138 55 Q 145 22, 128 42" fill="#6B5DD8" stroke="#6B5DD8" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 136 52 Q 141 30, 129 44" fill="#FF8FAB" opacity="0.45" />

        {/* ===== 面部 ===== */}
        <MascotFace mood={mood} animate={animate} />

        {/* ===== 面具配饰 ===== */}
        <MascotMask mood={mood} animate={animate} />

        {/* ===== 特效装饰 ===== */}
        {mood === 'happy' && (
          <>
            <motion.text x="50" y="30" fontSize="11" textAnchor="middle"
              animate={animate ? { opacity: [0, 1, 0], y: [30, 22, 30], scale: [0.5, 1, 0.5] } : undefined}
              transition={{ duration: 2, repeat: Infinity }}>✨</motion.text>
            <motion.text x="150" y="25" fontSize="9" textAnchor="middle"
              animate={animate ? { opacity: [0, 1, 0], y: [25, 18, 25], scale: [0.7, 1.1, 0.7] } : undefined}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.6 }}>✨</motion.text>
            <motion.text x="160" y="60" fontSize="7" textAnchor="middle"
              animate={animate ? { opacity: [0, 0.8, 0], scale: [0.5, 1, 0.5] } : undefined}
              transition={{ duration: 1.8, repeat: Infinity, delay: 1 }}>⭐</motion.text>
          </>
        )}

        {mood === 'meditation' && (
          <motion.circle cx="100" cy="100" r="82" fill="none" stroke="#4ECDC4" strokeWidth="1.2"
            strokeDasharray="6 5" opacity="0.35"
            animate={animate ? { rotate: 360 } : undefined}
            transition={animate ? { duration: 15, repeat: Infinity, ease: 'linear' } : undefined}
            style={{ transformOrigin: '100px 100px' }} />
        )}
      </svg>
    </motion.div>
  );
}

/* ===== 面部 ===== */
function MascotFace({ mood, animate }: { mood: MascotMood; animate: boolean }) {
  return (
    <g>
      {/* 腮红 */}
      <circle cx="72" cy="96" r="10" fill="url(#blushG)" />
      <circle cx="128" cy="96" r="10" fill="url(#blushG)" />

      {/* 眼睛 */}
      <Eyes mood={mood} animate={animate} />

      {/* 嘴巴 */}
      <Mouth mood={mood} />

      {/* 鼻子 — 小圆点 */}
      <ellipse cx="100" cy="88" rx="2.5" ry="2" fill="#3D3080" opacity="0.5" />
    </g>
  );
}

function Eyes({ mood, animate }: { mood: MascotMood; animate: boolean }) {
  // 眼睛位置
  const lx = 85, rx = 115, ey = 78;

  switch (mood) {
    case 'sleepy':
      return (
        <g>
          <path d={`M ${lx-6} ${ey} Q ${lx} ${ey+5}, ${lx+6} ${ey}`} stroke="#2D2B55" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d={`M ${rx-6} ${ey} Q ${rx} ${ey+5}, ${rx+6} ${ey}`} stroke="#2D2B55" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <motion.text x="145" y="52" fontSize="11" fill="#8B7CF7" opacity="0.5" fontWeight="bold"
            animate={animate ? { opacity: [0.2, 0.6, 0.2], y: [52, 44, 52] } : undefined}
            transition={animate ? { duration: 3, repeat: Infinity } : undefined}>z</motion.text>
          <motion.text x="153" y="40" fontSize="8" fill="#8B7CF7" opacity="0.35" fontWeight="bold"
            animate={animate ? { opacity: [0.1, 0.4, 0.1], y: [40, 32, 40] } : undefined}
            transition={animate ? { duration: 3, repeat: Infinity, delay: 0.6 } : undefined}>z</motion.text>
        </g>
      );

    case 'happy':
      return (
        <g>
          {/* 笑弯的月牙眼 */}
          <path d={`M ${lx-6} ${ey+1} Q ${lx} ${ey-6}, ${lx+6} ${ey+1}`} stroke="#2D2B55" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d={`M ${rx-6} ${ey+1} Q ${rx} ${ey-6}, ${rx+6} ${ey+1}`} stroke="#2D2B55" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      );

    case 'thinking':
      return (
        <g>
          <circle cx={lx} cy={ey} r="5.5" fill="#2D2B55" />
          <circle cx={lx-1.5} cy={ey-2} r="2.2" fill="white" />
          <circle cx={rx} cy={ey-1} r="4.5" fill="#2D2B55" />
          <circle cx={rx-1} cy={ey-3} r="1.8" fill="white" />
          <motion.text x="140" y="50" fontSize="16" fill="#8B7CF7" opacity="0.5" fontWeight="bold"
            animate={animate ? { opacity: [0.2, 0.6, 0.2], rotate: [-5, 8, -5] } : undefined}
            transition={animate ? { duration: 2.5, repeat: Infinity } : undefined}
            style={{ transformOrigin: '140px 42px' }}>?</motion.text>
        </g>
      );

    case 'peek':
      return (
        <g>
          {/* 眼珠看向右边 */}
          <circle cx={lx} cy={ey} r="5.5" fill="#2D2B55" />
          <circle cx={lx+2} cy={ey-1} r="2.2" fill="white" />
          <circle cx={rx} cy={ey} r="5.5" fill="#2D2B55" />
          <circle cx={rx+2} cy={ey-1} r="2.2" fill="white" />
        </g>
      );

    default:
      // 标准大圆眼 + 眨眼
      return (
        <g>
          <motion.g
            animate={animate ? { scaleY: [1, 1, 0.08, 1, 1] } : undefined}
            transition={animate ? { duration: 4, repeat: Infinity, times: [0, 0.42, 0.48, 0.54, 1] } : undefined}
            style={{ transformOrigin: `${lx}px ${ey}px` }}>
            <circle cx={lx} cy={ey} r="5.5" fill="#2D2B55" />
            <circle cx={lx-1.5} cy={ey-2} r="2.2" fill="white" />
          </motion.g>
          <motion.g
            animate={animate ? { scaleY: [1, 1, 0.08, 1, 1] } : undefined}
            transition={animate ? { duration: 4, repeat: Infinity, times: [0, 0.42, 0.48, 0.54, 1] } : undefined}
            style={{ transformOrigin: `${rx}px ${ey}px` }}>
            <circle cx={rx} cy={ey} r="5.5" fill="#2D2B55" />
            <circle cx={rx-1.5} cy={ey-2} r="2.2" fill="white" />
          </motion.g>
        </g>
      );
  }
}

function Mouth({ mood }: { mood: MascotMood }) {
  switch (mood) {
    case 'happy':
      return <path d="M 91 97 Q 100 108, 109 97" stroke="#2D2B55" strokeWidth="2" strokeLinecap="round" fill="none" />;
    case 'sleepy':
      return <ellipse cx="100" cy="97" rx="3.5" ry="2.5" fill="#3D3080" opacity="0.4" />;
    case 'thinking':
      return <path d="M 95 98 Q 100 96, 105 99" stroke="#2D2B55" strokeWidth="1.8" strokeLinecap="round" fill="none" />;
    default:
      return <path d="M 93 97 Q 100 103, 107 97" stroke="#2D2B55" strokeWidth="2" strokeLinecap="round" fill="none" />;
  }
}

/* ===== 小短手 ===== */
function MascotArms({ mood, animate }: { mood: MascotMood; animate: boolean }) {
  if (mood === 'waving') {
    return (
      <g>
        {/* 左手贴身 */}
        <ellipse cx="52" cy="115" rx="9" ry="12" fill="#5850C0" transform="rotate(20 52 115)" />
        {/* 右手挥动 */}
        <motion.g
          animate={animate ? { rotate: [-10, 20, -10] } : undefined}
          transition={animate ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } : undefined}
          style={{ transformOrigin: '148px 105px' }}>
          <ellipse cx="153" cy="98" rx="9" ry="13" fill="#5850C0" transform="rotate(-30 153 98)" />
          <circle cx="157" cy="89" r="3.5" fill="#D8D0F8" opacity="0.6" />
        </motion.g>
      </g>
    );
  }

  if (mood === 'meditation') {
    return (
      <g>
        <ellipse cx="68" cy="125" rx="9" ry="11" fill="#5850C0" transform="rotate(25 68 125)" />
        <ellipse cx="132" cy="125" rx="9" ry="11" fill="#5850C0" transform="rotate(-25 132 125)" />
      </g>
    );
  }

  // 默认小短手贴身
  return (
    <g>
      <ellipse cx="52" cy="115" rx="9" ry="12" fill="#5850C0" transform="rotate(20 52 115)" />
      <ellipse cx="148" cy="115" rx="9" ry="12" fill="#5850C0" transform="rotate(-20 148 115)" />
    </g>
  );
}

/* ===== 面具配饰 ===== */
function MascotMask({ mood, animate }: { mood: MascotMood; animate: boolean }) {
  const maskContent = (
    <g>
      <ellipse cx="0" cy="0" rx="12" ry="10" fill="url(#maskG)" />
      <ellipse cx="-4" cy="-1.5" rx="3" ry="2.2" fill="#2A9D8F" />
      <ellipse cx="4" cy="-1.5" rx="3" ry="2.2" fill="#2A9D8F" />
      <path d="M -4 3.5 Q 0 7, 4 3.5" stroke="#2A9D8F" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <circle cx="0" cy="-6" r="1.8" fill="url(#starG)" />
      <ellipse cx="-3" cy="-4" rx="2.5" ry="1.5" fill="white" opacity="0.2" />
    </g>
  );

  if (mood === 'sleepy') {
    return <g transform="translate(130, 38) rotate(30)">{maskContent}</g>;
  }

  return (
    <motion.g
      animate={animate ? { rotate: [0, 6, 0, -4, 0] } : undefined}
      transition={animate ? { duration: 5, repeat: Infinity, ease: 'easeInOut' } : undefined}
      style={{ transformOrigin: '142px 48px' }}>
      <g transform="translate(140, 40) rotate(12)">{maskContent}</g>
    </motion.g>
  );
}

/* ===== 便捷组件 ===== */
export function MascotWithSpeech({
  text, mood = 'default', size = 'md',
}: { text: string; mood?: MascotMood; size?: MascotSize }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(139,124,247,0.15)', borderRadius: 16,
          padding: '8px 14px', fontSize: 13, color: '#2D2B55',
          maxWidth: 200, textAlign: 'center', position: 'relative',
        }}>
        {text}
        <div style={{
          position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
          borderTop: '6px solid rgba(255,255,255,0.85)',
        }} />
      </motion.div>
      <Mascot mood={mood} size={size} />
    </div>
  );
}
