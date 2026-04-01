import { useOutletContext } from 'react-router-dom';
import HomeView from '../../components/dashboard/HomeView';

export default function DashboardHome() {
  const { goToDeploy } = useOutletContext();
  return <HomeView onDeploy={goToDeploy} />;
}