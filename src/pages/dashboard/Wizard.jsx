import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function DashboardWizardBridge() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    navigate('/dashboard/picker', {
      replace: true,
      state: {
        ...location.state,
        openWizard: true,
      },
    });
  }, [location.state, navigate]);

  return <div className="p-8 text-sm text-gray-500">Opening setup…</div>;
}
