import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function ProtectedAdminRoute({ children }) {
  const { user, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const isAdmin = Boolean(user?.isAdmin || user?.role === 'admin');

  useEffect(() => {
    if (!isLoadingAuth && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, isLoadingAuth, navigate]);

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return children;
}