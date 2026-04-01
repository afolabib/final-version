import { motion } from 'framer-motion';
import FreemiAgent from './FreemiAgent';

export default function SolutionsAgentGrid({ agents, selected, onSelect }) {
  return (
    <section id="agents" className="px-4 md:px-6 pb-6 md:pb-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-surface mb-2">Choose Your Operator</h2>
          <p className="text-sm md:text-base text-gray-500">Click any operator to see their full profile, capabilities, and live demo.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {agents.map((agent, i) => {
            const isActive = selected?.key === agent.key;
            return (
              <motion.button key={agent.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(agent)}
                className="relative rounded-2xl p-4 text-center transition-all duration-300 cursor-pointer"
                style={{
                  background: isActive ? `linear-gradient(135deg, ${agent.color}12, ${agent.color}06)` : 'rgba(255,255,255,0.85)',
                  border: isActive ? `2px solid ${agent.color}60` : '2px solid rgba(0,0,0,0.04)',
                  boxShadow: isActive ? `0 8px 28px ${agent.color}18` : '0 2px 12px rgba(0,0,0,0.03)',
                }}>
                {isActive && (
                  <motion.div layoutId="agent-indicator" className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                    style={{ background: agent.color }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
                )}
                <div className="flex justify-center mb-2">
                  <div className="scale-[0.55] origin-center -my-1">
                    <FreemiAgent agentKey={agent.key} size="sm" animate={isActive} />
                  </div>
                </div>
                <h3 className="font-bold text-sm text-surface">{agent.name}</h3>
                <span className="text-[10px] font-semibold block mt-0.5" style={{ color: agent.color }}>{agent.role}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}