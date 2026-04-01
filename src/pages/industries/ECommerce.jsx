import IndustryPage from '../../components/IndustryPage';

const data = {
  title: 'E-Commerce',
  headline: 'Run Your Store 24/7 Without Burning Out Your Team',
  subtitle: 'Freemi operators handle customer inquiries, process orders, manage vendor relationships, and drive repeat purchases — so you can focus on growing your brand, not answering the same questions.',
  color: '#00B894',
  operators: ['Rex', 'Nova', 'Pixel'],
  stats: [
    { value: '73%', label: 'Tickets auto-resolved' },
    { value: '< 30s', label: 'First response time' },
    { value: '28%', label: 'Repeat purchase lift' },
  ],
  painPoints: [
    { emoji: '📦', title: '"Where\'s my order?" on repeat', text: 'Your support team spends 60% of their time answering the same shipping and tracking questions. It\'s draining and doesn\'t scale.' },
    { emoji: '💸', title: 'Returns eat into margins', text: 'Without proactive sizing guides, product recommendations, and pre-purchase support, return rates stay stubbornly high.' },
    { emoji: '🤷', title: 'Vendors go radio silent', text: 'Managing dozens of suppliers means chasing invoices, confirming delivery dates, and dealing with quality issues — all manually.' },
    { emoji: '📧', title: 'Customers buy once and vanish', text: 'Without timely post-purchase follow-ups, review requests, and personalized offers, one-time buyers never come back.' },
  ],
  characterQuote: 'I just resolved 47 support tickets, sent tracking updates to 200 customers, and flagged a delayed shipment from your supplier — all before your morning coffee.',
  benefits: [
    { title: 'Instant Order Support', text: 'Customers get real-time tracking updates, return processing, and order modifications without waiting for a human. CSAT scores climb while your team handles only the complex stuff.' },
    { title: 'Smart Vendor Management', text: 'Nova tracks every PO, follows up on delayed shipments, reconciles invoices against delivery records, and flags discrepancies automatically. No more vendor chaos.' },
    { title: 'Post-Purchase Engagement', text: 'Pixel sends perfectly-timed review requests, cross-sell recommendations, and loyalty offers based on purchase history. Turn one-time buyers into brand advocates.' },
    { title: 'Pre-Sale Conversion', text: 'Rex answers product questions, suggests alternatives, and guides hesitant shoppers through checkout with live chat support — reducing abandoned carts significantly.' },
  ],
  workflows: [
    { title: 'Customer Inquiry → Instant Resolution', description: 'A customer asks about their order. Rex pulls tracking data, checks delivery status, drafts a clear response, and resolves the ticket — all in under 30 seconds.', tools: ['Shopify', 'Zendesk', 'ShipStation', 'Email'] },
    { title: 'New Order → Fulfillment Tracking', description: 'An order comes in. Nova confirms inventory, generates the packing slip, notifies the warehouse, sends the customer a confirmation email, and sets up delivery tracking alerts.', tools: ['Shopify', 'Email', 'Slack', 'ShipStation'] },
    { title: 'Vendor PO → Invoice Reconciliation', description: 'Nova sends the PO, tracks delivery confirmation, matches the invoice to the order, flags any price discrepancies, and queues the payment for approval.', tools: ['QuickBooks', 'Google Sheets', 'Email', 'Airtable'] },
    { title: 'Purchase → Repeat Customer', description: 'Five days after delivery, Pixel sends a review request. Two weeks later, a personalized product recommendation. A month later, an exclusive returning customer offer.', tools: ['Klaviyo', 'Shopify', 'Email', 'Analytics'] },
  ],
  testimonial: {
    quote: 'Our support team went from drowning in tickets to focusing on VIP customers. Rex handles 73% of inquiries automatically, and our CSAT actually went up.',
    name: 'Marcus Williams',
    role: 'Director of CX',
    company: 'Urban Essentials (DTC Brand)',
  },
};

export default function ECommerce() {
  return <IndustryPage data={data} />;
}