export default function TypeBadge({ type }) {
  const typeConfig = {
    email: { label: 'Email', bg: '#FEF3C7', color: '#D97706' },
    slack: { label: 'Slack', bg: '#E0E7FF', color: '#5B5FFF' },
    calendar: { label: 'Calendar', bg: '#F0FDF4', color: '#16A34A' },
    default: { label: 'Task', bg: '#F3F4F6', color: '#6B7280' },
  };

  const config = typeConfig[type] || typeConfig.default;

  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: config.bg, color: config.color }}>
      {config.label}
    </span>
  );
}