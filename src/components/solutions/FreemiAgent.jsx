import { motion } from 'framer-motion';

const agentStyles = {
  freemi: { color: '#5B5FFF', gradient: '#7C3AED', hat: null,      glasses: null },
  sam:   { color: '#4A6CF7', gradient: '#7FB3FF', hat: null,      glasses: 'round' },
  rex:   { color: '#E84393', gradient: '#FF6BB5', hat: 'cap',     glasses: 'shades' },
  nova:  { color: '#00B894', gradient: '#55EFC4', hat: 'tophat',  glasses: 'monocle' },
  pixel: { color: '#F39C12', gradient: '#F1C40F', hat: 'beanie',  glasses: 'round' },
  echo:  { color: '#0984E3', gradient: '#74B9FF', hat: null,      glasses: 'visor' },
  ghost: { color: '#636E72', gradient: '#B2BEC3', hat: 'hood',    glasses: 'patch' },
};

function Glasses({ type, bodySize }) {
  const s = bodySize;
  const cx = s / 2;
  const ey = s * 0.42;
  const r = s * 0.08;

  switch (type) {
    case 'round':
      return (
        <g>
          <circle cx={cx - r * 1.6} cy={ey} r={r * 1.3} fill="none" stroke="#2D3436" strokeWidth={s * 0.02} />
          <circle cx={cx + r * 1.6} cy={ey} r={r * 1.3} fill="none" stroke="#2D3436" strokeWidth={s * 0.02} />
          <line x1={cx - r * 0.3} y1={ey} x2={cx + r * 0.3} y2={ey} stroke="#2D3436" strokeWidth={s * 0.015} />
          <line x1={cx - r * 2.9} y1={ey - r * 0.3} x2={cx - r * 3.8} y2={ey - r * 0.8} stroke="#2D3436" strokeWidth={s * 0.015} />
          <line x1={cx + r * 2.9} y1={ey - r * 0.3} x2={cx + r * 3.8} y2={ey - r * 0.8} stroke="#2D3436" strokeWidth={s * 0.015} />
        </g>
      );
    case 'shades':
      return (
        <g>
          <rect x={cx - r * 3} y={ey - r} width={r * 2.6} height={r * 1.8} rx={r * 0.5} fill="#2D3436" />
          <rect x={cx + r * 0.4} y={ey - r} width={r * 2.6} height={r * 1.8} rx={r * 0.5} fill="#2D3436" />
          <line x1={cx - r * 0.4} y1={ey} x2={cx + r * 0.4} y2={ey} stroke="#2D3436" strokeWidth={s * 0.02} />
          <line x1={cx - r * 2.2 + r * 0.3} y1={ey - r * 0.5} x2={cx - r * 1.8} y2={ey - r * 0.5} stroke="rgba(255,255,255,0.25)" strokeWidth={s * 0.012} strokeLinecap="round" />
        </g>
      );
    case 'monocle':
      return (
        <g>
          <circle cx={cx + r * 1.6} cy={ey} r={r * 1.4} fill="none" stroke="#B8860B" strokeWidth={s * 0.02} />
          <line x1={cx + r * 1.6} y1={ey + r * 1.4} x2={cx + r * 1.6} y2={ey + r * 4} stroke="#B8860B" strokeWidth={s * 0.012} />
        </g>
      );
    case 'visor':
      return (
        <path
          d={`M${cx - r * 3.5} ${ey} Q${cx} ${ey - r * 1.5} ${cx + r * 3.5} ${ey} Q${cx} ${ey + r * 1} ${cx - r * 3.5} ${ey}Z`}
          fill="rgba(9,132,227,0.5)" stroke="#0984E3" strokeWidth={s * 0.012}
        />
      );
    case 'patch':
      return (
        <g>
          <ellipse cx={cx - r * 1.6} cy={ey} rx={r * 1.5} ry={r * 1.2} fill="#2D3436" />
          <line x1={cx - r * 3} y1={ey - r * 1.2} x2={cx + r * 0.5} y2={ey - r * 1.2} stroke="#2D3436" strokeWidth={s * 0.02} />
        </g>
      );
    default:
      return null;
  }
}

function HatAccessory({ type, color, bodySize }) {
  const s = bodySize;
  const cx = s / 2;

  switch (type) {
    case 'cap':
      return (
        <g>
          <ellipse cx={cx} cy={s * 0.08} rx={s * 0.35} ry={s * 0.07} fill={color} opacity="0.9" />
          <rect x={cx - s * 0.22} y={-s * 0.02} width={s * 0.44} height={s * 0.12} rx={s * 0.04} fill={color} />
          <rect x={cx + s * 0.05} y={s * 0.02} width={s * 0.22} height={s * 0.04} rx={s * 0.02} fill={color} opacity="0.65" />
        </g>
      );
    case 'tophat':
      return (
        <g>
          <rect x={cx - s * 0.18} y={-s * 0.18} width={s * 0.36} height={s * 0.22} rx={s * 0.03} fill="#2D3436" />
          <ellipse cx={cx} cy={s * 0.04} rx={s * 0.28} ry={s * 0.05} fill="#2D3436" />
          <rect x={cx - s * 0.15} y={-s * 0.02} width={s * 0.3} height={s * 0.025} rx={s * 0.01} fill="#B8860B" />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <path d={`M${cx - s * 0.22} ${s * 0.08} Q${cx - s * 0.22} ${-s * 0.12} ${cx} ${-s * 0.12} Q${cx + s * 0.22} ${-s * 0.12} ${cx + s * 0.22} ${s * 0.08}`} fill={color} opacity="0.85" />
          <circle cx={cx} cy={-s * 0.14} r={s * 0.04} fill={color} />
          <line x1={cx - s * 0.15} y1={-s * 0.02} x2={cx + s * 0.15} y2={-s * 0.02} stroke="rgba(255,255,255,0.25)" strokeWidth={s * 0.02} />
        </g>
      );
    case 'hood':
      return (
        <g>
          <path d={`M${cx - s * 0.34} ${s * 0.2} Q${cx - s * 0.34} ${-s * 0.2} ${cx} ${-s * 0.2} Q${cx + s * 0.34} ${-s * 0.2} ${cx + s * 0.34} ${s * 0.2}`} fill="#4A4A4A" opacity="0.85" />
          <path d={`M${cx - s * 0.28} ${s * 0.2} Q${cx - s * 0.28} ${-s * 0.12} ${cx} ${-s * 0.12} Q${cx + s * 0.28} ${-s * 0.12} ${cx + s * 0.28} ${s * 0.2}`} fill="#636E72" opacity="0.5" />
        </g>
      );
    default:
      return null;
  }
}

export default function FreemiAgent({ agentKey, size = 'lg', animate = true }) {
  const style = agentStyles[agentKey] || agentStyles.sam;
  const isLg = size === 'lg';
  const isMd = size === 'md';
  const body = isLg ? 120 : isMd ? 80 : 64;
  const eyeSize = isLg ? 28 : isMd ? 18 : 16;
  const radius = isLg ? 32 : isMd ? 20 : 16;
  const armW = isLg ? 10 : isMd ? 7 : 5;
  const armH = isLg ? 28 : isMd ? 18 : 14;
  const legW = isLg ? 10 : isMd ? 7 : 5;
  const legH = isLg ? 22 : isMd ? 14 : 11;
  const totalW = body + 40;
  const showLeftEye = style.glasses !== 'patch';

  const content = (
    <div className="relative flex flex-col items-center" style={{ width: totalW, height: body + legH + 12 }}>
      {/* Left arm */}
      <motion.div
        animate={animate ? { rotate: [0, -15, 0, 10, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
        className="absolute"
        style={{
          width: armW, height: armH, background: style.color,
          left: totalW / 2 - body / 2 - armW - 2, top: body * 0.45,
          transformOrigin: 'top center', borderRadius: armW,
        }}
      />
      {/* Right arm */}
      <motion.div
        animate={animate ? { rotate: [0, 15, 0, -10, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2, delay: 0.3 }}
        className="absolute"
        style={{
          width: armW, height: armH, background: style.color,
          right: totalW / 2 - body / 2 - armW - 2, top: body * 0.45,
          transformOrigin: 'top center', borderRadius: armW,
        }}
      />
      {/* Body */}
      <motion.div
        animate={animate ? { y: [0, -4, 0] } : {}}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center"
        style={{
          width: body, height: body, borderRadius: radius,
          background: `linear-gradient(135deg, ${style.color}, ${style.gradient})`,
          boxShadow: `0 8px 32px ${style.color}4D, inset 0 2px 0 rgba(255,255,255,0.15)`,
          overflow: 'visible',
        }}
      >
        {/* Hat + Glasses via SVG overlay */}
        <svg viewBox={`0 0 ${body} ${body}`} width={body} height={body}
          className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
          <HatAccessory type={style.hat} color={style.color} bodySize={body} />
          <Glasses type={style.glasses} bodySize={body} />
        </svg>
        {/* Eye(s) */}
        <div className="flex items-center" style={{ gap: body * 0.12 }}>
          {showLeftEye && (
            <motion.div
              animate={animate ? { scaleY: [1, 1, 0.08, 1, 1] } : {}}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1], ease: 'easeInOut' }}
              style={{ width: eyeSize * 0.7, height: eyeSize * 0.7, borderRadius: '50%', background: 'rgba(255,255,255,0.9)' }}
            />
          )}
          <motion.div
            animate={animate ? { scaleY: [1, 1, 0.08, 1, 1] } : {}}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1], ease: 'easeInOut', delay: 0.05 }}
            style={{
              width: showLeftEye ? eyeSize * 0.7 : eyeSize,
              height: showLeftEye ? eyeSize * 0.7 : eyeSize,
              borderRadius: '50%',
              background: style.glasses === 'patch' ? '#D63031' : 'rgba(255,255,255,0.9)',
            }}
          />
        </div>
      </motion.div>
      {/* Legs */}
      <div className="flex items-start" style={{ gap: isLg ? 20 : isMd ? 12 : 10, marginTop: -2 }}>
        <motion.div
          animate={animate ? { rotate: [0, 8, 0, -8, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
          style={{ width: legW, height: legH, background: style.color, borderRadius: legW, transformOrigin: 'top center' }}
        />
        <motion.div
          animate={animate ? { rotate: [0, -8, 0, 8, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3, delay: 0.2 }}
          style={{ width: legW, height: legH, background: style.color, borderRadius: legW, transformOrigin: 'top center' }}
        />
      </div>
    </div>
  );

  return content;
}

export { agentStyles };