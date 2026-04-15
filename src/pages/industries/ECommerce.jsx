import ProductPageLayout from '../../components/ProductPageLayout';
import { ShoppingCart, Package, CreditCard, Clock, Zap, BarChart3, MessageSquare, Globe, Star, RefreshCw, Truck, Tag, Heart, ShoppingBag, Percent, Gift } from 'lucide-react';

export default function ECommerce() {
  return (
    <ProductPageLayout badge="E-Commerce" badgeIcon={ShoppingCart} accentColor="#E84393"
      headline="Run Your Store 24/7" headlineAccent="Without Burning Out."
      subtitle="AI agents that handle customer support, order tracking, returns, product questions, and abandoned cart recovery — so you can focus on growing your brand."
      seed={220}
      stats={[{ value: '35%', label: 'Cart recovery rate' }, { value: '4s', label: 'Response time' }, { value: '80%', label: 'Auto-resolved' }, { value: '24/7', label: 'Customer support' }]}
      testimonials={[
        { quote: 'Abandoned cart recovery alone paid for the platform 10x over. AI sends personalised WhatsApp messages and 35% of customers come back.', name: 'Emma Clarke', role: 'Founder, Luma Beauty', gradient: 'linear-gradient(135deg, #E84393, #7B61FF)' },
        { quote: 'We scaled from 200 to 2,000 orders/month without hiring a single support person. AI handles everything.', name: 'Raj Patel', role: 'CEO, TechGear Store', gradient: 'linear-gradient(135deg, #2F8FFF, #27C087)' },
        { quote: 'Product questions answered in seconds, not hours. Our conversion rate went up 40% when customers got instant responses.', name: 'Anna Berg', role: 'Brand Manager, Nordic Home', gradient: 'linear-gradient(135deg, #F59E0B, #E84393)' },
      ]}
      features={[
        { icon: MessageSquare, title: 'Instant customer support', desc: 'AI answers product questions, sizing queries, shipping info, and returns policy — instantly across website, WhatsApp, and email.', color: '#E84393' },
        { icon: Package, title: 'Order tracking', desc: 'Customers check order status, delivery ETAs, and tracking info via chat. No more "where\'s my order?" emails.', color: '#2F8FFF' },
        { icon: RefreshCw, title: 'Returns & exchanges', desc: 'AI handles return requests, generates labels, processes exchanges, and keeps customers happy throughout.', color: '#7B61FF' },
        { icon: ShoppingBag, title: 'Abandoned cart recovery', desc: 'Personalised WhatsApp and email follow-ups to customers who left items in cart. 35% average recovery rate.', color: '#F59E0B' },
        { icon: Star, title: 'Product recommendations', desc: 'AI suggests products based on browsing history, past purchases, and stated preferences. Upsell that feels helpful.', color: '#27C087' },
        { icon: BarChart3, title: 'Customer insights', desc: 'Track common questions, popular products, support volume, and satisfaction. Data to grow your business.', color: '#0984E3' },
      ]}
      steps={[
        { icon: ShoppingCart, title: 'Connect your store', desc: 'Shopify, WooCommerce, or custom — we integrate with your e-commerce platform and tools.' },
        { icon: Globe, title: 'AI handles customers', desc: 'Product questions, order tracking, returns, and abandoned carts — all automated across channels.' },
        { icon: Zap, title: 'Scale without hiring', desc: 'Handle 10x the customer volume with the same team. AI does the heavy lifting.' },
      ]}
      useCases={[
        { icon: Tag, title: 'Fashion & Apparel', desc: 'Sizing help, style recommendations, return/exchange handling, and new collection announcements.', color: '#E84393', metric: '35%', metricLabel: 'Cart recovery', features: ['Sizing', 'Returns', 'Collections'] },
        { icon: Heart, title: 'Beauty & Wellness', desc: 'Ingredient queries, routine recommendations, subscription management, and reorder reminders.', color: '#7B61FF', metric: '89%', metricLabel: 'Auto-resolved', features: ['Ingredients', 'Routines', 'Subscriptions'] },
        { icon: Gift, title: 'Gifts & Specialty', desc: 'Gift finder, personalisation options, delivery timing, and corporate order handling.', color: '#2F8FFF', metric: '3×', metricLabel: 'Conversions', features: ['Gift Finder', 'Corporate', 'Delivery'] },
        { icon: CreditCard, title: 'Subscriptions', desc: 'Subscription management, billing queries, pause/cancel handling, and renewal reminders.', color: '#27C087', metric: '34%', metricLabel: 'Less churn', features: ['Billing', 'Pause/Cancel', 'Renewals'] },
        { icon: Percent, title: 'Marketplace', desc: 'Vendor queries, order routing, dispute resolution, and multi-seller coordination.', color: '#F59E0B', metric: '80%', metricLabel: 'Auto-handled', features: ['Vendors', 'Disputes', 'Routing'] },
        { icon: Truck, title: 'D2C Brands', desc: 'Pre-sale questions, shipping updates, loyalty rewards, and post-purchase engagement.', color: '#0984E3', metric: '4s', metricLabel: 'Response', features: ['Shipping', 'Loyalty', 'Engagement'] },
      ]}
      ctaHeadline="Sell more. Support less."
      ctaSubtitle="AI agents that handle your customer service so you can focus on growing your brand."
    />
  );
}
