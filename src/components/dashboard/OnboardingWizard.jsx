import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function OnboardingWizardBridge({ onBack }) {
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

  return (
    <div className="flex min-h-[320px] items-center justify-center p-8 text-center text-sm text-gray-500">
      <div>
        <div className="font-medium text-gray-700">Opening the current setup flow…</div>
        <button
          type="button"
          onClick={() => {
            if (onBack) {
              onBack();
              return;
            }
            navigate('/dashboard/picker', { replace: true, state: { openWizard: true } });
          }}
          className="mt-3 text-sm font-medium text-purple-600 hover:text-purple-700"
        >
          Continue manually
        </button>
      </div>
    </div>
  );
}
