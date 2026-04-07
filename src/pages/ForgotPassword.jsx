import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebaseClient';
import { ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setSent(true);
    } catch (err) {
      const map = {
        'auth/user-not-found': 'No account found with that email.',
        'auth/invalid-email':  'Please enter a valid email.',
      };
      setError(map[err.code] || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(91,95,255,0.18) 0%, transparent 70%)' }} />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}>
            <div className="w-3 h-3 rounded-full bg-white opacity-95" />
          </div>
          <span className="font-black text-lg tracking-tight" style={{ color: '#0A0F1E' }}>Freemi</span>
        </Link>
        <Link to="/login"
          className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: '#64748B' }}
          onMouseEnter={e => e.currentTarget.style.color = '#0A0F1E'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748B'}>
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </nav>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black mb-2" style={{ color: '#0A0F1E', letterSpacing: '-0.03em' }}>
              Reset your password
            </h1>
            <p className="text-sm" style={{ color: '#64748B' }}>
              {sent ? "Check your inbox for a reset link." : "Enter your email and we'll send a reset link."}
            </p>
          </div>

          <div className="rounded-2xl p-8"
            style={{
              background: 'rgba(255,255,255,0.90)',
              border: '1px solid rgba(91,95,255,0.10)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 40px rgba(91,95,255,0.10), 0 1px 0 rgba(255,255,255,0.8) inset',
            }}>

            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(16,185,129,0.10)', border: '1.5px solid rgba(16,185,129,0.20)' }}>
                  ✉️
                </div>
                <p className="text-sm" style={{ color: '#374151' }}>
                  We sent a reset link to <strong>{email}</strong>. Check your spam folder if you don't see it.
                </p>
                <Link to="/login"
                  className="block w-full text-center py-3 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', color: '#fff', boxShadow: '0 4px 18px rgba(124,58,237,0.35)' }}>
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: '#F8FAFF', border: '1.5px solid rgba(91,95,255,0.12)', color: '#0A0F1E' }}
                    onFocus={e => e.target.style.borderColor = '#5B5FFF'}
                    onBlur={e => e.target.style.borderColor = 'rgba(91,95,255,0.12)'}
                  />
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm font-medium"
                    style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#DC2626' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: loading ? 'rgba(91,95,255,0.6)' : 'linear-gradient(135deg, #5B5FFF, #7C3AED)',
                    color: '#fff',
                    boxShadow: loading ? 'none' : '0 4px 18px rgba(124,58,237,0.35)',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.50)'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow = '0 4px 18px rgba(124,58,237,0.35)'; }}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <>Send reset link <ArrowRight size={15} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
