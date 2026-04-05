import { useState, useRef } from 'react';
import { Send, Mic, Paperclip, Monitor, Puzzle, FileText, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/useFileUpload';
import AgentSettingsPanel from './AgentSettingsPanel';
import IntegrationsPopup from './IntegrationsPopup';
import SkillsPopup from './SkillsPopup';
import FilesPopup from './FilesPopup';

export default function ChatInput({ onSend, onOpenComputer, agent, companyId }) {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [tooltip, setTooltip] = useState('');
  const fileInputRef = useRef(null);
  const { uploadFile, uploading } = useFileUpload();

  const handleSend = () => {
    if (!input.trim()) return;
    onSend?.(input.trim());
    setInput('');
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFile(file);
      if (url) {
        setInput(prev => prev + (prev ? ' ' : '') + `[File: ${file.name}]`);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeAll = (except) => {
    if (except !== 'integrations') setShowIntegrations(false);
    if (except !== 'skills') setShowSkills(false);
    if (except !== 'settings') setShowSettings(false);
    if (except !== 'files') setShowFiles(false);
  };

  const toolbarItems = [
    { icon: Paperclip, id: 'attach', tip: 'Attach file', onClick: handleFileClick },
    { icon: Monitor, id: 'screen', tip: "Agent's computer", onClick: () => onOpenComputer?.() },
    { icon: Puzzle, id: 'skills', tip: 'Skills', onClick: () => { closeAll('skills'); setShowSkills(v => !v); } },
    { icon: FileText, id: 'file', tip: 'Files', onClick: () => { closeAll('files'); setShowFiles(v => !v); } },
  ];

  return (
    <div className="px-6 pb-5 pt-2">
      <div className="rounded-2xl overflow-visible relative" style={{ background: '#fff', border: '1px solid #E8EAFF', boxShadow: '0 4px 24px rgba(74,108,247,0.1)' }}>
        <div className="px-5 pt-4 pb-2">
          <textarea
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Assign a task or ask anything"
            className="w-full text-sm outline-none bg-transparent resize-none font-medium leading-relaxed"
            style={{ color: '#374151', caretColor: '#4A6CF7', minHeight: '24px', maxHeight: '120px' }}
          />
        </div>

        <div className="flex items-center justify-between px-3 py-2.5" style={{ borderTop: '1px solid #F0F1FF' }}>
          <div className="flex items-center gap-0.5">
            {toolbarItems.map(item => (
              <div key={item.id} className="relative">
                {/* Skills popup above this button */}
                {item.id === 'skills' && showSkills && (
                  <div className="absolute bottom-full mb-1 left-0 z-50">
                    <SkillsPopup />
                  </div>
                )}
                {/* Files popup above this button */}
                {item.id === 'file' && showFiles && (
                  <div className="absolute bottom-full mb-1 left-0 z-50">
                    <FilesPopup agent={agent} companyId={companyId} />
                  </div>
                )}
                <button
                  onClick={item.onClick}
                  className="p-2.5 rounded-xl transition-all"
                  style={{ color: (item.id === 'skills' && showSkills) ? '#4A6CF7' : '#C5C9E0', background: (item.id === 'skills' && showSkills) ? 'rgba(74,108,247,0.08)' : 'transparent' }}
                  onMouseEnter={e => { setTooltip(item.tip); if (!(item.id === 'skills' && showSkills)) { e.currentTarget.style.color = '#4A6CF7'; e.currentTarget.style.background = 'rgba(74,108,247,0.06)'; } }}
                  onMouseLeave={e => { setTooltip(''); if (!(item.id === 'skills' && showSkills)) { e.currentTarget.style.color = '#C5C9E0'; e.currentTarget.style.background = 'transparent'; } }}
                >
                  <item.icon size={15} strokeWidth={1.8} />
                </button>
                {item.id === 'attach' && (
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="*"
                  />
                )}
                {tooltip === item.tip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white whitespace-nowrap z-50 pointer-events-none"
                    style={{ background: '#0A0A1A', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                    {item.tip}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 relative">
            <button className="p-2.5 rounded-xl transition-all" style={{ color: '#C5C9E0' }}
              onClick={() => toast.info('Voice input coming soon.')}
              onMouseEnter={e => { e.currentTarget.style.color = '#4A6CF7'; e.currentTarget.style.background = 'rgba(74,108,247,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#C5C9E0'; e.currentTarget.style.background = 'transparent'; }}>
              <Mic size={15} strokeWidth={1.8} />
            </button>

            <div className="relative">
              <button
                onClick={() => { closeAll('settings'); setShowSettings(v => !v); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{ color: showSettings ? '#2563EB' : '#6B7280', background: showSettings ? 'rgba(37,99,235,0.08)' : '#F4F5FC', border: '1px solid #E8EAFF' }}>
                <Sparkles size={11} />
                AI Model
              </button>
              <AgentSettingsPanel show={showSettings} onClose={() => setShowSettings(false)} />
            </div>

            <button
              onClick={handleSend}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: input.trim() ? 'linear-gradient(135deg, #4A6CF7, #7B93FF)' : '#E8EAFF',
                boxShadow: input.trim() ? '0 4px 14px rgba(74,108,247,0.4)' : 'none',
              }}
            >
              <Send size={13} strokeWidth={2} style={{ color: input.trim() ? '#fff' : '#C5C9E0' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}