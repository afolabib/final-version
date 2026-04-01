import { motion } from 'framer-motion';

const activities = [
  { name: 'Customer outreach', status: 'running', color: 'text-green-600 bg-green-50' },
  { name: 'Weekly report', status: 'completed', color: 'text-blue-600 bg-blue-50' },
  { name: 'Customer follow-up', status: 'running', color: 'text-green-600 bg-green-50' },
  { name: 'Daily analysis', status: 'queued', color: 'text-yellow-600 bg-yellow-50' },
  { name: 'Invoice processing', status: 'completed', color: 'text-blue-600 bg-blue-50' },
];

const sidebar = ['Inbox', 'People', 'Agents', 'Automations', 'Tasks', 'Integrations', 'Activity'];

export default function ActivityPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className="max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-yellow-500 font-medium">✨ Live operator activity</span>
      </div>
      <div className="flex">
        <div className="w-40 border-r border-gray-100 py-3">
          {sidebar.map((item, i) => (
            <div
              key={item}
              className={`px-4 py-2 text-sm ${i === 2 ? 'text-spark bg-spark/5 font-medium border-l-2 border-spark' : 'text-gray-400'}`}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="flex-1 p-4">
          <div className="text-xs tracking-widest text-gray-400 font-medium mb-3">ACTIVITY</div>
          <div className="space-y-1">
            {activities.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-700">{a.name}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.color}`}>
                  {a.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}