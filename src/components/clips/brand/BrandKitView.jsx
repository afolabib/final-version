import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Palette, Type, Image, Trash2, Edit3, Check, X } from 'lucide-react';
import { useClips } from '@/contexts/ClipsContext';
import ClipsGlassCard from '../shared/ClipsGlassCard';
import ClipsGradientText from '../shared/ClipsGradientText';
import ClipsEmptyState from '../shared/ClipsEmptyState';

const PRESET_PALETTES = [
  { name: 'Violet Dream',  colors: { primary: '#5B5FFF', secondary: '#7C3AED', accent: '#06B6D4' } },
  { name: 'Sunset',        colors: { primary: '#F59E0B', secondary: '#EF4444', accent: '#F97316' } },
  { name: 'Ocean',         colors: { primary: '#0EA5E9', secondary: '#06B6D4', accent: '#14B8A6' } },
  { name: 'Forest',        colors: { primary: '#10B981', secondary: '#059669', accent: '#34D399' } },
  { name: 'Midnight',      colors: { primary: '#6366F1', secondary: '#5B5FFF', accent: '#A78BFA' } },
  { name: 'Rose',          colors: { primary: '#EC4899', secondary: '#F43F5E', accent: '#FB7185' } },
];

const CAPTION_PRESETS = [
  { id: 'classic', name: 'Classic', preview: 'White on dark', style: { color: '#fff', bg: 'rgba(0,0,0,0.7)' } },
  { id: 'karaoke', name: 'Karaoke', preview: 'Word highlight', style: { color: '#FBBF24', bg: 'rgba(0,0,0,0.8)' } },
  { id: 'neon', name: 'Neon Glow', preview: 'Purple glow', style: { color: '#5B5FFF', bg: 'transparent' } },
  { id: 'bold', name: 'Bold', preview: 'Large & impactful', style: { color: '#fff', bg: 'rgba(91,95,255,0.8)' } },
  { id: 'minimal', name: 'Minimal', preview: 'Subtle & clean', style: { color: '#94A3B8', bg: 'transparent' } },
  { id: 'gradient', name: 'Gradient', preview: 'Color transition', style: { color: '#fff', bg: 'linear-gradient(135deg,#5B5FFF,#7C3AED)' } },
];

const FONTS = ['Inter', 'Playfair Display', 'Space Grotesk', 'DM Sans', 'Outfit', 'Sora', 'Poppins', 'Montserrat'];

export default function BrandKitView() {
  const { brandKits, setBrandKits } = useClips();
  const [editing, setEditing] = useState(null);
  const [newKit, setNewKit] = useState(null);

  const handleCreate = () => {
    const kit = {
      id: `bk_${Date.now()}`,
      name: 'New Brand Kit',
      colors: PRESET_PALETTES[0].colors,
      fontFamily: 'Inter',
      captionStyle: 'classic',
    };
    setNewKit(kit);
    setEditing(kit.id);
  };

  const handleSave = (kit) => {
    if (newKit?.id === kit.id) {
      setBrandKits(prev => [...prev, kit]);
      setNewKit(null);
    } else {
      setBrandKits(prev => prev.map(k => k.id === kit.id ? kit : k));
    }
    setEditing(null);
  };

  const handleDelete = (id) => {
    setBrandKits(prev => prev.filter(k => k.id !== id));
  };

  const allKits = newKit ? [...brandKits, newKit] : brandKits;

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#0A0F1E' }}>
              <ClipsGradientText>Brand Kit</ClipsGradientText>
            </h1>
            <p className="text-sm" style={{ color: '#64748B' }}>Maintain consistent branding across all your clips</p>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 btn-press"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 4px 16px rgba(91,95,255,0.3)' }}
          >
            <Plus size={14} /> New Kit
          </button>
        </div>
      </motion.div>

      {allKits.length === 0 ? (
        <ClipsEmptyState
          icon={Palette}
          title="No Brand Kits Yet"
          description="Create your first brand kit to maintain consistent styling across all clips"
          action={
            <button onClick={handleCreate} className="px-4 py-2 rounded-xl text-xs font-bold text-white btn-press"
              style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
              <Plus size={14} className="inline mr-1" /> Create Brand Kit
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {allKits.map((kit, i) => (
              <motion.div key={kit.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ClipsGlassCard className="p-5">
                  {/* Kit header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold" style={{ color: '#0A0F1E' }}>{kit.name}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(editing === kit.id ? null : kit.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <Edit3 size={14} style={{ color: '#64748B' }} />
                      </button>
                      <button onClick={() => handleDelete(kit.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={14} className="text-red-400/60" />
                      </button>
                    </div>
                  </div>

                  {/* Color preview */}
                  <div className="flex gap-2 mb-4">
                    {Object.entries(kit.colors).map(([key, color]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg" style={{ background: color }} />
                        <div>
                          <p className="text-[10px] capitalize" style={{ color: '#64748B' }}>{key}</p>
                          <p className="text-[10px] font-mono" style={{ color: '#94A3B8' }}>{color}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Font */}
                  <div className="flex items-center gap-2 mb-3">
                    <Type size={14} style={{ color: '#64748B' }} />
                    <span className="text-xs" style={{ color: '#64748B' }}>Font:</span>
                    <span className="text-xs font-medium" style={{ fontFamily: kit.fontFamily, color: '#0A0F1E' }}>{kit.fontFamily}</span>
                  </div>

                  {/* Caption preview */}
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(91,95,255,0.03)' }}>
                    <span className="text-sm font-bold" style={{ color: kit.colors.primary }}>
                      Caption Preview Text
                    </span>
                  </div>

                  {/* Expanded editor */}
                  {editing === kit.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4"
                      style={{ borderTop: '1px solid rgba(91,95,255,0.08)' }}>
                      {/* Color palettes */}
                      <label className="text-[11px] font-semibold mb-2 block" style={{ color: '#64748B' }}>Color Palette</label>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {PRESET_PALETTES.map(p => (
                          <button key={p.name}
                            onClick={() => handleSave({ ...kit, colors: p.colors })}
                            className="p-2 rounded-lg text-center transition-all"
                            style={{ background: 'rgba(91,95,255,0.03)', border: '1px solid rgba(91,95,255,0.06)' }}>
                            <div className="flex gap-1 justify-center mb-1">
                              {Object.values(p.colors).map((c, j) => (
                                <div key={j} className="w-4 h-4 rounded-full" style={{ background: c }} />
                              ))}
                            </div>
                            <span className="text-[9px]" style={{ color: '#64748B' }}>{p.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* Font selector */}
                      <label className="text-[11px] font-semibold mb-2 block" style={{ color: '#64748B' }}>Font</label>
                      <div className="grid grid-cols-4 gap-1.5 mb-4">
                        {FONTS.map(f => (
                          <button key={f}
                            onClick={() => handleSave({ ...kit, fontFamily: f })}
                            className="px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                            style={{
                              fontFamily: f,
                              background: kit.fontFamily === f ? 'rgba(91,95,255,0.08)' : 'rgba(91,95,255,0.02)',
                              color: kit.fontFamily === f ? '#5B5FFF' : '#64748B',
                              border: `1px solid ${kit.fontFamily === f ? 'rgba(91,95,255,0.15)' : 'rgba(91,95,255,0.05)'}`,
                            }}>
                            {f.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </ClipsGlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
