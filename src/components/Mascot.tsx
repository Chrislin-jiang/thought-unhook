/**
 * 戏精猫 — 出戏 OffStage 应用陪伴形象
 * 
 * 设计灵感：OtterLife 海獭的圆润扁平可爱风格
 * 融合：薰衣草紫色系 + 戏剧面具元素
 * 
 * 支持多种情绪状态和姿势动画
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
      animate={
        animate
          ? {
              y: [0, -6, 0],
            }
          : undefined
      }
      transition={
        animate
          ? {
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : undefined
      }
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          {/* 主体渐变 — 深薰衣草紫 */}
          <linearGradient id="bodyGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#7B6CF0" />
            <stop offset="100%" stopColor="#6355D8" />
          </linearGradient>

          {/* 腮红渐变 */}
          <radialGradient id="blushL" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF8FAB" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FF8FAB" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="blushR" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF8FAB" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FF8FAB" stopOpacity="0" />
          </radialGradient>

          {/* 身体高光 */}
          <radialGradient id="bodyHighlight" cx="40%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#A89CFB" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#A89CFB" stopOpacity="0" />
          </radialGradient>

          {/* 肚皮颜色 */}
          <linearGradient id="bellyGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#EDE9FE" />
            <stop offset="100%" stopColor="#DDD6FE" />
          </linearGradient>

          {/* 面具渐变 — 薄荷绿 */}
          <linearGradient id="maskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ECDC4" />
            <stop offset="100%" stopColor="#45B7AA" />
          </linearGradient>

          {/* 面具上的装饰星 */}
          <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFB36B" />
          </linearGradient>

          {/* 阴影 */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6355D8" floodOpacity="0.15" />
          </filter>
          <filter id="maskShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2A9D8F" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* ===== 尾巴 ===== */}
        <motion.path
          d="M 145 155 Q 168 140, 175 118 Q 180 102, 172 95"
          stroke="url(#bodyGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          animate={
            animate
              ? { d: [
                  'M 145 155 Q 168 140, 175 118 Q 180 102, 172 95',
                  'M 145 155 Q 172 135, 178 115 Q 184 98, 170 88',
                  'M 145 155 Q 168 140, 175 118 Q 180 102, 172 95',
                ] }
              : undefined
          }
          transition={animate ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : undefined}
        />

        {/* ===== 身体 ===== */}
        <ellipse
          cx="100"
          cy="125"
          rx="52"
          ry="55"
          fill="url(#bodyGrad)"
          filter="url(#softShadow)"
        />

        {/* 身体高光 */}
        <ellipse cx="100" cy="125" rx="52" ry="55" fill="url(#bodyHighlight)" />

        {/* ===== 肚皮 ===== */}
        <ellipse cx="100" cy="132" rx="30" ry="32" fill="url(#bellyGrad)" opacity="0.9" />

        {/* ===== 左手 ===== */}
        <MascotArm side="left" mood={mood} animate={animate} />

        {/* ===== 右手 ===== */}
        <MascotArm side="right" mood={mood} animate={animate} />

        {/* ===== 脚 ===== */}
        <ellipse cx="80" cy="175" rx="16" ry="8" fill="#5B4ECF" />
        <ellipse cx="120" cy="175" rx="16" ry="8" fill="#5B4ECF" />
        {/* 脚底高光 */}
        <ellipse cx="80" cy="174" rx="10" ry="5" fill="#EDE9FE" opacity="0.5" />
        <ellipse cx="120" cy="174" rx="10" ry="5" fill="#EDE9FE" opacity="0.5" />

        {/* ===== 头部 ===== */}
        <circle cx="100" cy="80" r="45" fill="url(#bodyGrad)" filter="url(#softShadow)" />
        {/* 头部高光 */}
        <circle cx="100" cy="80" r="45" fill="url(#bodyHighlight)" />

        {/* ===== 耳朵 ===== */}
        {/* 左耳 */}
        <path d="M 65 52 L 55 25 L 80 45 Z" fill="#7B6CF0" />
        <path d="M 67 50 L 59 30 L 77 46 Z" fill="#FF8FAB" opacity="0.5" />
        {/* 右耳 */}
        <path d="M 135 52 L 145 25 L 120 45 Z" fill="#7B6CF0" />
        <path d="M 133 50 L 141 30 L 123 46 Z" fill="#FF8FAB" opacity="0.5" />

        {/* ===== 面部 ===== */}
        <MascotFace mood={mood} animate={animate} />

        {/* ===== 面具（右耳旁 / 头上装饰）===== */}
        <MascotMask mood={mood} animate={animate} />

        {/* ===== 头顶星星装饰 ===== */}
        {mood === 'happy' && (
          <>
            <motion.g
              animate={animate ? { opacity: [0, 1, 0], y: [0, -8, 0], scale: [0.6, 1, 0.6] } : undefined}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            >
              <text x="55" y="28" fontSize="10" textAnchor="middle">✨</text>
            </motion.g>
            <motion.g
              animate={animate ? { opacity: [0, 1, 0], y: [0, -6, 0], scale: [0.8, 1.1, 0.8] } : undefined}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            >
              <text x="145" y="22" fontSize="8" textAnchor="middle">✨</text>
            </motion.g>
          </>
        )}

        {/* ===== 冥想光环 ===== */}
        {mood === 'meditation' && (
          <motion.circle
            cx="100"
            cy="80"
            r="55"
            fill="none"
            stroke="#4ECDC4"
            strokeWidth="1.5"
            strokeDasharray="8 6"
            opacity="0.4"
            animate={animate ? { rotate: 360 } : undefined}
            transition={animate ? { duration: 12, repeat: Infinity, ease: 'linear' } : undefined}
            style={{ transformOrigin: '100px 80px' }}
          />
        )}
      </svg>
    </motion.div>
  );
}

/* ===== 面部表情子组件 ===== */
function MascotFace({ mood, animate }: { mood: MascotMood; animate: boolean }) {
  const eyes = getEyes(mood, animate);
  const mouth = getMouth(mood, animate);

  return (
    <g>
      {/* 腮红 */}
      <circle cx="74" cy="92" r="9" fill="url(#blushL)" />
      <circle cx="126" cy="92" r="9" fill="url(#blushR)" />

      {/* 眼睛 */}
      {eyes}

      {/* 嘴巴 */}
      {mouth}

      {/* 胡须 */}
      <line x1="55" y1="85" x2="72" y2="88" stroke="#A89CFB" strokeWidth="1" opacity="0.4" />
      <line x1="55" y1="92" x2="72" y2="92" stroke="#A89CFB" strokeWidth="1" opacity="0.4" />
      <line x1="128" y1="88" x2="145" y2="85" stroke="#A89CFB" strokeWidth="1" opacity="0.4" />
      <line x1="128" y1="92" x2="145" y2="92" stroke="#A89CFB" strokeWidth="1" opacity="0.4" />
    </g>
  );
}

function getEyes(mood: MascotMood, animate: boolean) {
  switch (mood) {
    case 'sleepy':
      return (
        <g>
          {/* 眯眯眼 */}
          <path d="M 82 82 Q 87 86, 92 82" stroke="#2D2B55" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 108 82 Q 113 86, 118 82" stroke="#2D2B55" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* zzz */}
          <motion.text
            x="140" y="55" fontSize="10" fill="#8B7CF7" opacity="0.6" fontWeight="bold"
            animate={animate ? { opacity: [0.3, 0.7, 0.3], y: [55, 48, 55] } : undefined}
            transition={animate ? { duration: 3, repeat: Infinity } : undefined}
          >
            z
          </motion.text>
          <motion.text
            x="148" y="45" fontSize="8" fill="#8B7CF7" opacity="0.4" fontWeight="bold"
            animate={animate ? { opacity: [0.2, 0.5, 0.2], y: [45, 38, 45] } : undefined}
            transition={animate ? { duration: 3, repeat: Infinity, delay: 0.5 } : undefined}
          >
            z
          </motion.text>
        </g>
      );

    case 'happy':
      return (
        <g>
          {/* 笑弯的眼 — 倒U型 */}
          <path d="M 83 80 Q 87 74, 91 80" stroke="#2D2B55" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 109 80 Q 113 74, 117 80" stroke="#2D2B55" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      );

    case 'thinking':
      return (
        <g>
          {/* 一只眼大一只眼小 */}
          <circle cx="87" cy="80" r="5" fill="#2D2B55" />
          <circle cx="86" cy="78" r="2" fill="white" />
          <ellipse cx="113" cy="80" rx="4" ry="5" fill="#2D2B55" />
          <circle cx="112" cy="78" r="1.5" fill="white" />
          {/* 思考的问号 */}
          <motion.text
            x="135" y="55" fontSize="14" fill="#8B7CF7" opacity="0.6" fontWeight="bold"
            animate={animate ? { opacity: [0.3, 0.7, 0.3], rotate: [0, 10, 0] } : undefined}
            transition={animate ? { duration: 2.5, repeat: Infinity } : undefined}
            style={{ transformOrigin: '135px 48px' }}
          >
            ?
          </motion.text>
        </g>
      );

    case 'peek':
      return (
        <g>
          {/* 偷看的眼神 — 看向一边 */}
          <circle cx="87" cy="80" r="5" fill="#2D2B55" />
          <circle cx="89" cy="79" r="2" fill="white" />
          <circle cx="113" cy="80" r="5" fill="#2D2B55" />
          <circle cx="115" cy="79" r="2" fill="white" />
        </g>
      );

    default:
      // default / waving / meditation
      return (
        <g>
          {/* 标准圆眼 */}
          <motion.g
            animate={
              animate
                ? {
                    scaleY: [1, 1, 0.1, 1, 1],
                  }
                : undefined
            }
            transition={
              animate
                ? {
                    duration: 4,
                    repeat: Infinity,
                    times: [0, 0.45, 0.5, 0.55, 1],
                  }
                : undefined
            }
            style={{ transformOrigin: '87px 80px' }}
          >
            <circle cx="87" cy="80" r="5" fill="#2D2B55" />
            <circle cx="86" cy="78" r="2" fill="white" />
          </motion.g>
          <motion.g
            animate={
              animate
                ? {
                    scaleY: [1, 1, 0.1, 1, 1],
                  }
                : undefined
            }
            transition={
              animate
                ? {
                    duration: 4,
                    repeat: Infinity,
                    times: [0, 0.45, 0.5, 0.55, 1],
                  }
                : undefined
            }
            style={{ transformOrigin: '113px 80px' }}
          >
            <circle cx="113" cy="80" r="5" fill="#2D2B55" />
            <circle cx="112" cy="78" r="2" fill="white" />
          </motion.g>
        </g>
      );
  }
}

function getMouth(mood: MascotMood, _animate: boolean) {
  switch (mood) {
    case 'happy':
      return (
        <path d="M 92 95 Q 100 105, 108 95" stroke="#2D2B55" strokeWidth="2" strokeLinecap="round" fill="none" />
      );
    case 'sleepy':
      return (
        <circle cx="100" cy="96" r="3" fill="#2D2B55" opacity="0.5" />
      );
    case 'thinking':
      return (
        <path d="M 95 97 Q 100 95, 105 97" stroke="#2D2B55" strokeWidth="2" strokeLinecap="round" fill="none" />
      );
    case 'meditation':
      return (
        <path d="M 94 95 Q 100 100, 106 95" stroke="#2D2B55" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      );
    default:
      // 微笑小嘴
      return (
        <path d="M 94 95 Q 100 101, 106 95" stroke="#2D2B55" strokeWidth="2" strokeLinecap="round" fill="none" />
      );
  }
}

/* ===== 手臂子组件 ===== */
function MascotArm({ side, mood, animate }: { side: 'left' | 'right'; mood: MascotMood; animate: boolean }) {
  const isLeft = side === 'left';

  if (mood === 'waving' && !isLeft) {
    // 右手挥动
    return (
      <motion.g
        animate={animate ? { rotate: [0, -15, 15, -15, 0] } : undefined}
        transition={animate ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
        style={{ transformOrigin: '140px 110px' }}
      >
        <ellipse cx="148" cy="105" rx="10" ry="14" fill="#6B5DD3" transform="rotate(-25 148 105)" />
        {/* 小肉垫 */}
        <circle cx="152" cy="96" r="4" fill="#EDE9FE" opacity="0.7" />
      </motion.g>
    );
  }

  if (mood === 'meditation') {
    // 双手合十姿势 — 手臂朝向身体中间
    const cx = isLeft ? 80 : 120;
    const moveX = isLeft ? 8 : -8;
    return (
      <ellipse
        cx={cx + moveX}
        cy="130"
        rx="10"
        ry="13"
        fill="#6B5DD3"
        transform={`rotate(${isLeft ? 15 : -15} ${cx + moveX} 130)`}
      />
    );
  }

  // 默认手臂
  const cx = isLeft ? 55 : 145;
  const rotation = isLeft ? 15 : -15;
  return (
    <ellipse cx={cx} cy="120" rx="10" ry="14" fill="#6B5DD3" transform={`rotate(${rotation} ${cx} 120)`} />
  );
}

/* ===== 面具装饰子组件 ===== */
function MascotMask({ mood, animate }: { mood: MascotMood; animate: boolean }) {
  if (mood === 'sleepy') {
    // 睡觉时面具歪在头上
    return (
      <g transform="translate(125, 40) rotate(25)">
        <MaskShape />
      </g>
    );
  }

  // 默认：面具挂在右耳旁边
  return (
    <motion.g
      animate={animate ? { rotate: [0, 5, 0, -3, 0] } : undefined}
      transition={animate ? { duration: 5, repeat: Infinity, ease: 'easeInOut' } : undefined}
      style={{ transformOrigin: '148px 55px' }}
    >
      <g transform="translate(135, 42) rotate(15)">
        <MaskShape />
      </g>
    </motion.g>
  );
}

function MaskShape() {
  return (
    <g>
      {/* 面具主体 — 圆润戏剧面具 */}
      <ellipse cx="0" cy="0" rx="14" ry="12" fill="url(#maskGrad)" filter="url(#maskShadow)" />
      {/* 面具眼洞 */}
      <ellipse cx="-5" cy="-2" rx="3.5" ry="2.5" fill="#2A9D8F" />
      <ellipse cx="5" cy="-2" rx="3.5" ry="2.5" fill="#2A9D8F" />
      {/* 面具微笑 */}
      <path d="M -5 4 Q 0 8, 5 4" stroke="#2A9D8F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* 面具额头星星 */}
      <circle cx="0" cy="-7" r="2" fill="url(#starGrad)" />
      {/* 面具高光 */}
      <ellipse cx="-4" cy="-5" rx="3" ry="2" fill="white" opacity="0.2" />
    </g>
  );
}

/* ===== 便捷用法示例组件 ===== */
export function MascotWithSpeech({
  text,
  mood = 'default',
  size = 'md',
}: {
  text: string;
  mood?: MascotMood;
  size?: MascotSize;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(139,124,247,0.15)',
          borderRadius: 16,
          padding: '8px 14px',
          fontSize: 13,
          color: '#2D2B55',
          maxWidth: 200,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {text}
        {/* 小三角 */}
        <div
          style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(255,255,255,0.85)',
          }}
        />
      </motion.div>
      <Mascot mood={mood} size={size} />
    </div>
  );
}
