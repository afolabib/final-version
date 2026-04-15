import ProductPageLayout from '../../components/ProductPageLayout';
import { Package, Truck, MapPin, Clock, Zap, BarChart3, Phone, Globe, Bell, AlertTriangle, ClipboardList, Warehouse, Navigation, Shield, Fuel, Container } from 'lucide-react';

export default function Logistics() {
  return (
    <ProductPageLayout badge="Logistics" badgeIcon={Package} accentColor="#2F8FFF"
      headline="Keep Your Supply Chain" headlineAccent="Moving. Automatically."
      subtitle="AI agents that handle order tracking, delivery updates, driver communication, and customer enquiries — keeping your operations smooth without the manual overhead."
      seed={210}
      stats={[{ value: '70%', label: 'Fewer tracking calls' }, { value: '99.2%', label: 'On-time updates' }, { value: '5hrs', label: 'Saved daily' }, { value: '24/7', label: 'Dispatch support' }]}
      testimonials={[
        { quote: 'Tracking enquiries used to consume our entire customer service team. Now AI handles 70% of them instantly via WhatsApp.', name: 'Mark Sullivan', role: 'Operations Director, FastTrack Logistics', gradient: 'linear-gradient(135deg, #2F8FFF, #7B61FF)' },
        { quote: 'Delivery ETAs are sent automatically. Customers stopped calling to ask "where\'s my order?" — because they already know.', name: 'Lisa Ng', role: 'CEO, Pacific Express', gradient: 'linear-gradient(135deg, #27C087, #2F8FFF)' },
        { quote: 'Driver coordination is seamless now. AI assigns routes, sends instructions, and handles schedule changes without a dispatcher.', name: 'Tom Brady', role: 'Fleet Manager, Metro Couriers', gradient: 'linear-gradient(135deg, #F59E0B, #E84393)' },
      ]}
      features={[
        { icon: MapPin, title: 'Real-time tracking updates', desc: 'Automated delivery status updates via WhatsApp, SMS, and email. Customers always know where their order is.', color: '#2F8FFF' },
        { icon: Truck, title: 'Driver coordination', desc: 'AI assigns routes, sends delivery instructions, handles schedule changes, and manages driver communications.', color: '#7B61FF' },
        { icon: Phone, title: 'Customer enquiry handling', desc: 'AI answers tracking questions, handles complaints, processes returns, and escalates urgent issues.', color: '#27C087' },
        { icon: AlertTriangle, title: 'Exception management', desc: 'Delayed deliveries, failed attempts, address issues — AI notifies customers and offers solutions proactively.', color: '#F59E0B' },
        { icon: BarChart3, title: 'Delivery analytics', desc: 'Track on-time rates, delivery volumes, common issues, and customer satisfaction. Data-driven operations.', color: '#E84393' },
        { icon: Bell, title: 'Proactive notifications', desc: 'Dispatch confirmations, ETA updates, delivery confirmations, and feedback requests — all automated.', color: '#0984E3' },
      ]}
      steps={[
        { icon: Package, title: 'Connect your systems', desc: 'Link your order management, fleet tracking, and customer database. We integrate with your existing tools.' },
        { icon: Globe, title: 'AI handles communications', desc: 'Tracking updates, customer queries, driver coordination — all automated across every channel.' },
        { icon: Zap, title: 'Operations run themselves', desc: 'Fewer calls, faster responses, happier customers. Your team focuses on what matters.' },
      ]}
      useCases={[
        { icon: Truck, title: 'Last-Mile Delivery', desc: 'ETA updates, delivery instructions, failed delivery rebooking, and proof of delivery notifications.', color: '#E84393', metric: '99.2%', metricLabel: 'On-time', features: ['ETAs', 'Rebooking', 'Proof'] },
        { icon: Warehouse, title: 'Warehouse & Fulfilment', desc: 'Order status updates, stock alerts, pick-pack notifications, and dispatch confirmations.', color: '#7B61FF', metric: '70%', metricLabel: 'Fewer calls', features: ['Stock', 'Pick-Pack', 'Dispatch'] },
        { icon: Container, title: 'Freight & Shipping', desc: 'Shipment tracking, customs documentation queries, arrival notifications, and cargo status updates.', color: '#2F8FFF', metric: '24/7', metricLabel: 'Tracking', features: ['Customs', 'Arrivals', 'Cargo'] },
        { icon: Navigation, title: 'Fleet Management', desc: 'Route assignment, driver communication, maintenance scheduling, and incident reporting.', color: '#27C087', metric: '5hrs', metricLabel: 'Saved daily', features: ['Routes', 'Drivers', 'Maintenance'] },
        { icon: Shield, title: 'Cold Chain', desc: 'Temperature alerts, compliance documentation, delivery window management, and quality assurance tracking.', color: '#F59E0B', metric: '100%', metricLabel: 'Compliance', features: ['Temp Alerts', 'Compliance', 'QA'] },
        { icon: Fuel, title: 'Field Services', desc: 'Job assignment, customer scheduling, completion updates, and invoicing triggers.', color: '#0984E3', metric: '3×', metricLabel: 'Efficiency', features: ['Jobs', 'Scheduling', 'Invoicing'] },
      ]}
      ctaHeadline="Smoother operations. Happier customers."
      ctaSubtitle="AI agents that keep your supply chain moving — without the manual overhead."
    />
  );
}
