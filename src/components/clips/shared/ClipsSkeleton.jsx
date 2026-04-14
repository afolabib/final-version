export default function ClipsSkeleton({ className = '', count = 1 }) {
  return Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`rounded-xl clips-shimmer ${className}`}
      style={{ background: 'rgba(139,92,246,0.08)' }}
    />
  ));
}
