import { useOutletContext } from 'react-router-dom';
import AgentsView from '../../components/dashboard/AgentsView';

export default function DashboardAgents() {
  const { goToDeploy } = useOutletContext();
  return <AgentsView onDeploy={goToDeploy} />;
}