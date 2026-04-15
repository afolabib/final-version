import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebaseClient';
import { Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#EF4444', '#F59E0B', '#10B981', '#10B981'];

function passwordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const strength = passwordStrength(password);

  const friendly = code => {
    const map = {
      'auth/email-already-in-use': 'An account with that email already exists.',
      'auth/invalid-email':        'Please enter a valid email.',
      'auth/weak-password':        'Password must be at least 6 characters.',
    };
    return map[code] || 'Something went wrong. Please try again.';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (strength < 2) { setError('Please choose a stronger password.'); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateProfile(cred.user, { displayName: name });
      navigate('/dashboard/wizard');
    } catch (err) {
      setError(friendly(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firebaseAuth, provider);
      navigate('/dashboard/wizard');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError(friendly(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.10) 0%, transparent 70%)' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}>
            <div className="w-3 h-3 rounded-full bg-white opacity-95" />
          </div>
          <span className="font-black text-lg tracking-tight" style={{ color: '#0A0F1E' }}>Freemi</span>
        </Link>
        <Link to="/login"
          className="text-sm font-medium transition-colors"
          style={{ color: '#64748B' }}
          onMouseEnter={e => e.currentTarget.style.color = '#0A0F1E'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748B'}>
          Have an account?{' '}
          <span className="font-bold" style={{ color: '#7B61FF' }}>Sign in →</span>
        </Link>
      </nav>

      {/* Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-bold"
              style={{ background: 'rgba(123,97,255,0.08)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.18)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Free to start · No card required
            </div>
            <h1 className="text-3xl font-black mb-2" style={{ color: '#0A0F1E', letterSpacing: '-0.03em' }}>
              Build your AI workforce
            </h1>
            <p className="text-sm" style={{ color: '#64748B' }}>Create your Freemi workspace in seconds</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-8"
            style={{
              background: 'rgba(255,255,255,0.90)',
              border: '1px solid rgba(123,97,255,0.10)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 40px rgba(123,97,255,0.10), 0 1px 0 rgba(255,255,255,0.8) inset',
            }}>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all mb-5"
              style={{
                background: '#fff',
                border: '1.5px solid rgba(123,97,255,0.15)',
                color: '#374151',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,97,255,0.35)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(123,97,255,0.10)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(123,97,255,0.15)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.2 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.5 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.3 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.5 29.2 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.7-3.3-11.3-8L6 33.2C9.4 39.6 16.3 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41.2 35.1 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(123,97,255,0.10)' }} />
              <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(123,97,255,0.10)' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: '#F8FAFF',
                    border: '1.5px solid rgba(123,97,255,0.12)',
                    color: '#0A0F1E',
                  }}
                  onFocus={e => e.target.style.borderColor = '#7B61FF'}
                  onBlur={e => e.target.style.borderColor = 'rgba(123,97,255,0.12)'}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                  Work email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: '#F8FAFF',
                    border: '1.5px solid rgba(123,97,255,0.12)',
                    color: '#0A0F1E',
                  }}
                  onFocus={e => e.target.style.borderColor = '#7B61FF'}
                  onBlur={e => e.target.style.borderColor = 'rgba(123,97,255,0.12)'}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: '#F8FAFF',
                      border: '1.5px solid rgba(123,97,255,0.12)',
                      color: '#0A0F1E',
                    }}
                    onFocus={e => e.target.style.borderColor = '#7B61FF'}
                    onBlur={e => e.target.style.borderColor = 'rgba(123,97,255,0.12)'}
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#94A3B8' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#7B61FF'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength bar */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all"
                          style={{ background: i <= strength ? STRENGTH_COLORS[strength] : 'rgba(0,0,0,0.08)' }} />
                      ))}
                    </div>
                    <p className="text-[11px] font-medium" style={{ color: STRENGTH_COLORS[strength] }}>
                      {STRENGTH_LABELS[strength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#DC2626' }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all mt-2"
                style={{
                  background: loading ? 'rgba(123,97,255,0.5)' : 'linear-gradient(135deg, #7B61FF, #6C4AE8)',
                  color: '#fff',
                  boxShadow: loading ? 'none' : '0 4px 18px rgba(124,58,237,0.35)',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.50)'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow = '0 4px 18px rgba(124,58,237,0.35)'; }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : (
                  <>Create free account <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          </div>

          {/* Social proof / trust */}
          <div className="flex items-center justify-center gap-6 mt-6">
            {['SOC 2 ready', 'GDPR compliant', 'No card needed'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: '#64748B' }}>
                <Check size={11} style={{ color: '#10B981' }} strokeWidth={3} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
