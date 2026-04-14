import { useParams } from 'react-router-dom';
import ClipEditorView from '@/components/clips/editor/ClipEditorView';
export default function ClipsEditor() {
  const { clipId } = useParams();
  return <ClipEditorView clipId={clipId} />;
}
