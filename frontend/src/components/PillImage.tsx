/* 알약 이미지 — 실제 사진 대신 모양·색으로 SVG 생성 (프로토타입 더미) */
export type PillKind = 'capsule' | 'oval' | 'round' | 'caplet'
export type PillLook = { kind: PillKind; color: string; color2?: string }

const HL = 'rgba(255,255,255,0.42)'
const EDGE = 'rgba(0,0,0,0.20)'

export default function PillImage({ look, size = 56 }: { look: PillLook; size?: number }) {
  const { kind, color, color2 } = look
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {kind === 'oval' && (
        <g transform="rotate(-18 32 32)">
          <ellipse cx="32" cy="32" rx="24" ry="14" fill={color} stroke={EDGE} />
          <ellipse cx="24" cy="27" rx="7" ry="2.6" fill={HL} />
        </g>
      )}
      {kind === 'caplet' && (
        <g transform="rotate(-18 32 32)">
          <rect x="10" y="26" width="44" height="12" rx="6" fill={color} stroke={EDGE} />
          <line x1="32" y1="27" x2="32" y2="37" stroke={EDGE} />
          <rect x="15" y="29" width="10" height="2.4" rx="1.2" fill={HL} />
        </g>
      )}
      {kind === 'round' && (
        <g>
          <circle cx="32" cy="32" r="15" fill={color} stroke={EDGE} />
          <line x1="17" y1="32" x2="47" y2="32" stroke={EDGE} />
          <ellipse cx="27" cy="26" rx="5" ry="2.2" fill={HL} />
        </g>
      )}
      {kind === 'capsule' && (
        <g transform="rotate(-18 32 32)">
          <rect x="10" y="25" width="44" height="14" rx="7" fill={color2 ?? '#e9ecf0'} stroke={EDGE} />
          <path d="M10 32a7 7 0 0 1 7-7h15v14H17a7 7 0 0 1-7-7z" fill={color} stroke={EDGE} />
          <rect x="15" y="28" width="9" height="2.4" rx="1.2" fill={HL} />
        </g>
      )}
    </svg>
  )
}
