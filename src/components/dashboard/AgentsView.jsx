import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Sparkles, Activity } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';

export default function AgentsView({ onDeploy }) {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const q = query(collection(firestore, 'instances'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAgents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching agents:', error);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.06)' }}>
          <Activity size={15} style={{ color: '#6366F1' }} />
        </div>
        <div>
          <h2 className="text-lg font-extrabold tracking-tight" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>Your Live Agents</h2>
          <p className="text-xs" style={{ color: '#94A3B8' }}>{agents.length} agents deployed</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 mb-8" style={{ borderColor: '#E8EAFF' }}>
        {loading ? (
          <div className="text-sm" style={{ color: '#94A3B8' }}>Loading agents...</div>
        ) : agents.length === 0 ? (
          <div className="text-sm" style={{ color: '#94A3B8' }}>No agents yet. Deploy your first operator.</div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent) => (
              <div key={agent.id} className="rounded-xl border p-4 flex items-center justify-between" style={{ borderColor: '#EEF2FF' }}>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{agent.agentName || agent.agentType || 'Operator'}</div>
                  <div className="text-xs text-gray-500">Status: {agent.status || 'provisioning'} · Plan: {agent.plan || 'pro'}</div>
                </div>
                <button onClick={() => navigate('/dashboard/instances')} className="text-xs font-semibold text-indigo-600">View</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onDeploy}
        className="w-full rounded-2xl py-6 flex flex-col items-center justify-center gap-2 transition-all"
        style={{ border: '2px dashed rgba(37,99,235,0.2)', color: '#2563EB', background: 'rgba(37,99,235,0.02)' }}
      >
        <Sparkles size={20} strokeWidth={1.8} />
        <span className="text-sm font-bold">Start deploying a new agent</span>
        <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>Choose from templates or build custom</span>
      </button>
    </div>
  );
}
