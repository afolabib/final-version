import { motion } from 'framer-motion';

const roleTools = {
  sales: [
    { icon: '📧', name: 'Email', active: true },
    { icon: '📊', name: 'CRM', active: true },
    { icon: '📅', name: 'Calendar', active: false },
    { icon: '💬', name: 'Slack', active: false },
  ],
  support: [
    { icon: '🎫', name: 'Helpdesk', active: true },
    { icon: '📚', name: 'Docs', active: true },
    { icon: '💬', name: 'Slack', active: false },
    { icon: '📊', name: 'Analytics', active: false },
  ],
  ops: [
    { icon: '📋', name: 'Sheets', active: true },
    { icon: '📧', name: 'Email', active: true },
    { icon: '💰', name: 'Accounting', active: false },
    { icon: '📊', name: 'Reports', active: false },
  ],
  cs: [
    { icon: '📊', name: 'CRM', active: true },
    { icon: '📈', name: 'Analytics', active: true },
    { icon: '📧', name: 'Email', active: false },
    { icon: '💬', name: 'Chat', active: false },
  ],
  exec: [
    { icon: '📅', name: 'Calendar', active: true },
    { icon: '📧', name: 'Email', active: true },
    { icon: '📄', name: 'Docs', active: false },
    { icon: '📊', name: 'Dashboard', active: false },
  ],
};

export default function LiveToolsBar({ roleKey, color }) {
  const tools = roleTools[roleKey] || roleTools.sales;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tools.map((tool, i) => (
        <motion.div
          key={tool.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.1 }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium relative"
          style={{
            background: tool.active ? `${color}08` : 'rgba(0,0,0,0.02)',
            border: `1px solid ${tool.active ? color + '20' : 'rgba(0,0,0,0.04)'}`,
            color: tool.active ? color : '#9CA3AF',
          }}
        >
          <span>{tool.icon}</span>
          <span>{tool.name}</span>
          {tool.active && (
            <motion.div
              className="w-1 h-1 rounded-full absolute -top-0.5 -right-0.5"
              style={{ background: '#22C55E' }}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}