import { useParams } from 'react-router-dom';
import ClipsGalleryView from '@/components/clips/gallery/ClipsGalleryView';
export default function ClipsProject() {
  const { projectId } = useParams();
  return <ClipsGalleryView projectId={projectId} />;
}
