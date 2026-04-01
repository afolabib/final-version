import IndustryPage from '../../components/IndustryPage';

const data = {
  title: 'Logistics',
  headline: 'Keep Your Supply Chain Moving Without the Manual Work',
  subtitle: 'Freemi operators track shipments, manage vendor communications, reconcile invoices, and generate operations reports — keeping your logistics running smoothly around the clock.',
  color: '#0984E3',
  operators: ['Nova', 'Ghost', 'Rex'],
  stats: [
    { value: '94%', label: 'On-time delivery rate' },
    { value: '$45K', label: 'Annual savings' },
    { value: '0', label: 'Invoice errors this quarter' },
  ],
  painPoints: [
    { emoji: '🚚', title: 'Shipment delays catch you off guard', text: 'By the time you find out about a delay, it\'s already impacted your customer. Manual tracking across carriers is impossible at scale.' },
    { emoji: '📧', title: 'Vendor follow-ups are a full-time job', text: 'Confirming delivery dates, chasing late shipments, and negotiating with carriers eats up hours every day.' },
    { emoji: '🧾', title: 'Invoice reconciliation is a nightmare', text: 'Matching hundreds of invoices to POs, catching overcharges, and resolving disputes manually is error-prone and time-consuming.' },
    { emoji: '📋', title: 'Reporting is always behind', text: 'By the time your weekly logistics report is compiled, the data is already stale. Real-time visibility feels like a pipe dream.' },
  ],
  characterQuote: 'I just flagged 3 delayed shipments, rerouted a carrier, reconciled 47 invoices, and sent your daily ops dashboard — all before the warehouse opened.',
  benefits: [
    { title: 'Real-Time Shipment Monitoring', text: 'Nova tracks every shipment across all carriers, alerts your team to delays instantly, suggests rerouting options, and notifies customers proactively before they have to ask.' },
    { title: 'Automated Vendor Communications', text: 'PO confirmations, delivery follow-ups, and dispute resolution happen automatically. Ghost maintains a complete vendor intelligence database with performance scorecards.' },
    { title: 'Error-Free Invoice Processing', text: 'Nova matches every invoice to its PO, verifies quantities and pricing, flags discrepancies, and queues clean invoices for payment — eliminating manual reconciliation.' },
    { title: 'Live Operations Dashboard', text: 'Daily reports are generated automatically with delivery metrics, carrier performance, cost analysis, and exception summaries. Your ops team starts every morning fully informed.' },
  ],
  workflows: [
    { title: 'Shipment Created → Delivery Confirmed', description: 'A shipment is dispatched. Nova tracks it across carriers, sends status updates to your team, alerts on delays, and confirms delivery with the receiving warehouse — all automatically.', tools: ['ShipStation', 'Slack', 'Email', 'Google Sheets'] },
    { title: 'PO Sent → Invoice Reconciled', description: 'Nova sends the PO to the vendor, confirms receipt, tracks delivery, matches the invoice to the order, verifies line items, and flags any discrepancies before payment.', tools: ['QuickBooks', 'Email', 'Airtable', 'Google Sheets'] },
    { title: 'Delay Detected → Customer Notified', description: 'A carrier reports a delay. Nova immediately alerts your ops team, drafts a customer notification with a revised ETA, and suggests alternative fulfillment options.', tools: ['Carrier API', 'Slack', 'Email', 'CRM'] },
    { title: 'Week End → Ops Report Delivered', description: 'Every Friday, Nova compiles delivery rates, carrier performance, cost per shipment, exception logs, and trend analysis into a clean report for your leadership team.', tools: ['Google Sheets', 'Analytics', 'Email', 'Slack'] },
  ],
  testimonial: {
    quote: 'Invoice reconciliation used to take our team 2 days every month. Nova does it in real-time with zero errors. We\'ve saved over $45K in the first year just from catching overcharges.',
    name: 'Rachel Green',
    role: 'VP of Operations',
    company: 'SwiftRoute Logistics',
  },
};

export default function Logistics() {
  return <IndustryPage data={data} />;
}