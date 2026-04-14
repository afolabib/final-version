import { useLocation, useNavigate } from 'react-router-dom';

export default function useClipsNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isStandalone = location.pathname.startsWith('/clips/studio');
  const basePath = isStandalone ? '/clips/studio' : '/dashboard/clips';

  const navTo = (path) => navigate(`${basePath}/${path}`);
  const projectPath = (projectId) => `${basePath}/project/${projectId}`;
  const editorPath = (clipId) => `${basePath}/editor/${clipId}`;
  const dashboardPath = basePath;

  return { basePath, navTo, projectPath, editorPath, dashboardPath, navigate };
}
