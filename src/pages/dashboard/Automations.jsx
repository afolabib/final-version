import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardAutomations() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/dashboard/routines', { replace: true }); }, [navigate]);
  return null;
}
