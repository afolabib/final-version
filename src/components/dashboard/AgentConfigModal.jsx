import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, MessageCircle, Bot, Link, Code2, Wrench, CreditCard, FolderOpen, Search, RefreshCw, Trash2, ExternalLink, Plus, Eye, EyeOff, FileText, Check, ChevronRight, Shield, Palette, Globe, Bell, Key, Zap } from 'lucide-react';
import SettingsTab from './config-tabs/SettingsTab';
import ChannelsTab from './config-tabs/ChannelsTab';
import AIModelTab from './config-tabs/AIModelTab';
import IntegrationsTab from './config-tabs/IntegrationsTab';
import CustomAPIsTab from './config-tabs/CustomAPIsTab';
import SkillsTab from './config-tabs/SkillsTab';
import BillingTab from './config-tabs/BillingTab';
import FilesTab from './config-tabs/FilesTab';

const configTabs = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'channels', label: 'Channels', icon: MessageCircle },
  { id: 'ai-model', label: 'AI Model', icon: Bot },
  { id: 'integrations', label: 'Integrations', icon: Link },
  { id: 'custom-apis', label: 'Custom APIs', icon: Code2 },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'files', label: 'Files', icon: FolderOpen },
];

function TabContent({ tab }) {
  switch (tab) {
    case 'settings': return <SettingsTab />;
    case 'channels': return <ChannelsTab />;
    case 'ai-model': return <AIModelTab />;
    case 'integrations': return <IntegrationsTab />;
    case 'custom-apis': return <CustomAPIsTab />;
    case 'skills': return <SkillsTab />;
    case 'billing': return <BillingTab />;
    case 'files': return <FilesTab />;
    default: return null;
  }
}

export default function AgentConfigModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex rounded-3xl overflow-hidden"
        style={{
          width: '880px',
          maxWidth: '92vw',
          height: '640px',
          maxHeight: '88vh',
          background: '#FFFFFF',
          border: '1px solid #E8EAFF',
          boxShadow: '0 32px 100px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 flex flex-col py-5 px-3"
          style={{ background: '#F4F5FC', borderRight: '1px solid #E8EAFF' }}>

          {/* Agent header */}
          <div className="flex items-center gap-3 px-3 pb-4 mb-3" style={{ borderBottom: '1px solid #E8EAFF' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4A6CF7, #6366F1)', boxShadow: '0 4px 12px rgba(74,108,247,0.3)' }}>A</div>
            <div className="min-w-0">
              <span className="text-sm font-bold block truncate" style={{ color: '#0A0A1A' }}>Atlas</span>
              <span className="text-[10px] font-medium" style={{ color: '#9CA3AF' }}>/ Configure</span>
            </div>
          </div>

          <p className="text-[9px] font-bold tracking-[0.15em] uppercase px-3 mb-2.5" style={{ color: '#9CA3AF' }}>Configure</p>
          <nav className="space-y-0.5">
            {configTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
                  style={{
                    color: isActive ? '#FFFFFF' : '#6B7280',
                    background: isActive ? '#4A6CF7' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    boxShadow: isActive ? '0 2px 8px rgba(74,108,247,0.25)' : 'none',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(74,108,247,0.06)'; e.currentTarget.style.color = '#374151'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; } }}>
                  <tab.icon size={14} strokeWidth={isActive ? 2.2 : 1.8} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar with close */}
          <div className="flex items-center justify-end px-5 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid #E8EAFF' }}>
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ color: '#9CA3AF' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,108,247,0.06)'; e.currentTarget.style.color = '#4A6CF7'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; }}>
              <X size={15} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <TabContent tab={activeTab} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}