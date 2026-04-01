import { useState, useRef, useEffect } from 'react';
import { Home, Bot, Inbox, FolderOpen, CheckSquare, Zap, Plug, Wrench, Settings, Plus, HelpCircle, CreditCard, LayoutGrid, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { firestore } from '@/lib/firebaseClient';

const navItems = [
  { icon: Home, label: 'Home', id: 'home' },
  { icon: Bot, label: 'Agents', id: 'agents' },
  { icon: Inbox, label: 'Inbox', id: 'inbox' },
  { icon: FolderOpen, label: 'Files', id: 'files', badge: 'Beta' },
  { icon: CheckSquare, label: 'Tasks', id: 'tasks' },
];

const configItems = [
  { icon: Zap, label: 'Automations', id: 'automations', badge: 'Beta' },
  { icon: Plug, label: 'Integrations', id: 'integrations' },
  { icon: Wrench, label: 'Skills', id: 'skills' },
  { icon: Settings, label: 'Settings', id: 'settings' },
  { icon: CreditCard, label: 'Credits', id: 'credits' },
  { icon: HelpCircle, label: 'Support', id: 'support' },
];



function NavBtn({ item, active, onClick }) {
  const isActive = active === item.id;
  return (
    <button
      onClick={() => onClick(item.id)}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium nav-pill"
      style={{
        color: isActive ? '#6C5CE7' : '#6B7280',
        background: isActive ? 'rgba(108,92,231,0.08)' : 'transparent',
        fontWeight: isActive ? 600 : 500,
        boxShadow: isActive ? 'inset 0 0 0 1px rgba(108,92,231,0.15)' : 'none',
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(108,92,231,0.05)'; e.currentTarget.style.color = '#6C5CE7'; } }}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; } }}
    >
      <item.icon size={15} strokeWidth={isActive ? 2.2 : 1.8} style={{ color: isActive ? '#6C5CE7' : 'inherit', transition: 'color 180ms' }} />
      <span>{item.label}</span>
      {item.badge && (
        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(108,92,231,0.08)', color: '#6C5CE7' }}>{item.badge}</span>
      )}
    </button>
  );
}

function UserMenu({ onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const name = user?.full_name || 'User';
  const email = user?.email || '';
  const initial = name[0]?.toUpperCase() || 'U';

  return (
    <div className="absolute bottom-14 left-2 right-2 rounded-2xl overflow-hidden z-50"
      style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(108,92,231,0.12)', boxShadow: '0 8px 32px rgba(108,92,231,0.12), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
      {/* User info */}
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid rgba(91,95,255,0.1)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)', boxShadow: '0 4px 12px rgba(108,92,231,0.3)' }}>{initial}</div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#0A0A1A' }}>{name}</p>
          <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{email}</p>
        </div>
      </div>
      {/* Plan row */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(108,92,231,0.1)' }}>
        <span className="text-sm" style={{ color: '#6B7280' }}>Starter</span>
        <button onClick={() => { navigate('/dashboard/credits'); onClose(); }} className="px-6 py-2 rounded-full text-xs font-bold transition-all" style={{ background: 'transparent', color: '#6C5CE7', border: '1.5px solid rgba(108,92,231,0.3)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,92,231,0.08)'; e.currentTarget.style.borderColor = 'rgba(108,92,231,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(108,92,231,0.3)'; }}>Upgrade</button>
      </div>
      {/* Menu items */}
      {[
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
        { label: 'Homepage', icon: Home, path: '/' },
      ].map(item => (
        <button key={item.label}
          onClick={() => { navigate(item.path); onClose(); }}
          className="w-full flex items-center justify-between px-4 py-3 text-sm transition-colors"
          style={{ color: '#6B7280', borderBottom: '1px solid rgba(108,92,231,0.1)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,92,231,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div className="flex items-center gap-2.5">
            <item.icon size={15} strokeWidth={1.8} />
            <span>{item.label}</span>
          </div>
        </button>
      ))}
      {/* Sign out */}
      <button
        onClick={() => logout()}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors"
        style={{ color: '#EF4444' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <LogOut size={15} strokeWidth={1.8} />
        <span>Sign out</span>
      </button>
    </div>
  );
}

export default function DashboardSidebar({ active, onNav }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [agents, setAgents] = useState([]);
  const menuRef = useRef(null);

  const name = user?.full_name || 'User';
  const initial = name[0]?.toUpperCase() || 'U';

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const fetchInstances = async () => {
      if (!user?.uid) {
        setAgents([]);
        return;
      }

      try {
        const instancesQuery = query(
          collection(firestore, 'instances'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(instancesQuery);
        const instanceAgents = snapshot.docs.map((doc) => {
          const data = doc.data() || {};
          const derivedName = data.agentName || data.answers?.agent_name || data.agentType || data.subdomain || 'Agent';

          return {
            id: doc.id,
            name: derivedName,
            status: data.status || 'provisioning',
            url: data.url || null,
          };
        });

        setAgents(instanceAgents);
      } catch (error) {
        console.error('Error fetching sidebar instances:', error);
        setAgents([]);
      }
    };

    fetchInstances();
  }, [user?.uid]);

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col h-full m-2 rounded-2xl overflow-visible relative"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(108,92,231,0.08)', boxShadow: '0 8px 30px rgba(108,92,231,0.08), inset 0 1px 0 rgba(255,255,255,0.5)' }}>

      {showMenu && (
        <div ref={menuRef}>
          <UserMenu onClose={() => setShowMenu(false)} />
        </div>
      )}

      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(108,92,231,0.08)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ambient-pulse"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)', boxShadow: '0 4px 12px rgba(108,92,231,0.35)' }}>
            <div className="w-2.5 h-2.5 rounded-full bg-white opacity-90" />
          </div>
          <span className="font-bold text-sm tracking-tight" style={{ color: '#0A0A1A', fontFamily: 'var(--font-body)' }}>Freemi</span>
        </div>
        <button className="text-slate-300 hover:text-slate-400 transition-colors"><LayoutGrid size={13} /></button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {navItems.map(item => <NavBtn key={item.id} item={item} active={active} onClick={onNav} />)}

        <div className="pt-4 pb-1 px-3">
          <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#CBD5E1' }}>Configure</span>
        </div>
        {configItems.map(item => <NavBtn key={item.id} item={item} active={active} onClick={onNav} />)}

        <div className="pt-4 pb-1 px-3 flex items-center justify-between">
          <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#CBD5E1' }}>Deployed agents</span>
          <button className="w-5 h-5 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors" style={{ color: '#CBD5E1' }}>
            <Plus size={11} />
          </button>
        </div>

        {agents.map(agent => (
          <button key={agent.id} onClick={() => navigate('/dashboard/instances')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm nav-pill"
            style={{ color: '#6B7280' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,92,231,0.05)'; e.currentTarget.style.color = '#6C5CE7'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)', boxShadow: '0 2px 6px rgba(108,92,231,0.3)' }}>
              {agent.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="font-medium">{agent.name}</span>
          </button>
        ))}
        {agents.length === 0 && (
          <p className="px-3 py-2 text-xs" style={{ color: '#CBD5E1' }}>No agents yet</p>
        )}
      </nav>

      {/* Bottom - user row */}
      <div className="px-2 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(108,92,231,0.08)' }}>
        <button onClick={() => setShowMenu(s => !s)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all"
          style={{ color: '#374151' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,92,231,0.06)'; e.currentTarget.style.color = '#6C5CE7'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)', boxShadow: '0 4px 12px rgba(108,92,231,0.3)' }}>{initial}</div>
          <span className="text-sm font-semibold truncate flex-1 text-left">{name.split(' ')[0]}</span>
          <span style={{ color: '#CBD5E1', fontSize: 10 }}>◇</span>
        </button>
      </div>
    </aside>
  );
}