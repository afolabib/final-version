import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Server, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ instances: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const instances = await base44.entities.CustomerInstance.list();
        const users = await base44.entities.User.list();
        setStats({
          instances: instances.length,
          users: users.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#0F172A' }}>Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage instances and users</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Instances</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#2563EB' }}>{stats.instances}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(37,99,235,0.1)' }}>
                <Server size={24} style={{ color: '#2563EB' }} />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#2563EB' }}>{stats.users}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(37,99,235,0.1)' }}>
                <Users size={24} style={{ color: '#2563EB' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={20} style={{ color: '#2563EB' }} />
          <h2 className="text-lg font-semibold">Quick Actions</h2>
        </div>
        <div className="space-y-2">
          <p className="text-gray-600 text-sm">View instance management and user controls in the sidebar.</p>
        </div>
      </div>
    </div>
  );
}