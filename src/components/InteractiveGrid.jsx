export default function InteractiveGrid() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
      aria-hidden="true"
      style={{
        backgroundImage:
          'linear-gradient(rgba(91,95,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(91,95,255,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }}
    />
  );
}