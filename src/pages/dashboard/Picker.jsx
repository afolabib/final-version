import { useNavigate } from 'react-router-dom';
import AgentPicker from '../../components/dashboard/AgentPicker';

export default function DashboardPicker() {
  const navigate = useNavigate();
  return (
    <AgentPicker
      onBack={() => navigate('/dashboard/agents')}
    />
  );
}