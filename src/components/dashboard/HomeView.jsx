import { useProduct } from '@/contexts/ProductContext';
import FreemiCommandCenter from './FreemiCommandCenter';
import WidgetHome from './widget/WidgetHome';
import VoiceHome from './voice/VoiceHome';
import WebsiteHome from './website/WebsiteHome';

export default function HomeView() {
  const { activeProduct } = useProduct();

  if (activeProduct === 'widget')  return <WidgetHome />;
  if (activeProduct === 'voice')   return <VoiceHome />;
  if (activeProduct === 'website') return <WebsiteHome />;

  return <FreemiCommandCenter />;
}
