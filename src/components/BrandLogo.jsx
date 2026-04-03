import { useState } from 'react';

// Map display name → Simple Icons slug
const SLUG_MAP = {
  'Slack': 'slack',
  'GitHub': 'github',
  'Gmail': 'gmail',
  'Google Calendar': 'googlecalendar',
  'Google Drive': 'googledrive',
  'HubSpot': 'hubspot',
  'Stripe': 'stripe',
  'Notion': 'notion',
  'Salesforce': 'salesforce',
  'OpenAI': 'openai',
  'WhatsApp': 'whatsapp',
  'Twilio': 'twilio',
  'Discord': 'discord',
  'Telegram': 'telegram',
  'PayPal': 'paypal',
  'Intercom': 'intercom',
  'Airtable': 'airtable',
  'Zapier': 'zapier',
  'Shopify': 'shopify',
  'WordPress': 'wordpress',
  'Vercel': 'vercel',
  'Linear': 'linear',
  'Asana': 'asana',
  'Jira': 'jira',
  'Figma': 'figma',
  'Canva': 'canva',
  'Monday.com': 'monday',
  'Zendesk': 'zendesk',
  'Pipedrive': 'pipedrive',
  'Twitch': 'twitch',
  'YouTube': 'youtube',
  'Twitter': 'x',
  'X': 'x',
  'LinkedIn': 'linkedin',
  'Instagram': 'instagram',
  'Facebook': 'facebook',
  'Google Ads': 'googleads',
  'Mailchimp': 'mailchimp',
  'HubSpot CRM': 'hubspot',
  'Dropbox': 'dropbox',
  'Box': 'box',
  'AWS': 'amazonaws',
  'Google Cloud': 'googlecloud',
  'Azure': 'microsoftazure',
  'Supabase': 'supabase',
  'Firebase': 'firebase',
  'MongoDB': 'mongodb',
  'PostgreSQL': 'postgresql',
  'Redis': 'redis',
  'Typeform': 'typeform',
  'Calendly': 'calendly',
  'Zoom': 'zoom',
  'Google Meet': 'googlemeet',
  'Microsoft Teams': 'microsoftteams',
  'Webflow': 'webflow',
  'Framer': 'framer',
  'Loom': 'loom',
  'Miro': 'miro',
  'ClickUp': 'clickup',
  'Trello': 'trello',
  'Confluence': 'confluence',
  'Gitlab': 'gitlab',
  'Bitbucket': 'bitbucket',
  'Sentry': 'sentry',
  'Datadog': 'datadog',
  'Segment': 'segment',
  'Mixpanel': 'mixpanel',
  'Amplitude': 'amplitude',
  'Klaviyo': 'klaviyo',
  'Mailgun': 'mailgun',
  'SendGrid': 'sendgrid',
  'Brex': 'brex',
  'QuickBooks': 'intuit',
  'Xero': 'xero',
};

// Brand accent colors (used as bg tile tint when logo is dark)
const LIGHT_LOGO_BRANDS = new Set(['Notion', 'Vercel', 'GitHub']);

export default function BrandLogo({ name, fallbackColor = '#5B5FFF', size = 40 }) {
  const [failed, setFailed] = useState(false);
  const slug = SLUG_MAP[name];
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const isLight = LIGHT_LOGO_BRANDS.has(name);

  if (!slug || failed) {
    // Fallback: colored tile with initial
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: fallbackColor === '#000000' || fallbackColor === '#181717' ? '#1a1a2e' : fallbackColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: size * 0.38,
          flexShrink: 0,
          boxShadow: `0 4px 12px ${fallbackColor}40`,
        }}>
        {initial}
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: isLight ? '#f0f0f0' : 'white',
        border: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
      <img
        src={`https://cdn.simpleicons.org/${slug}`}
        alt={name}
        width={size * 0.55}
        height={size * 0.55}
        onError={() => setFailed(true)}
        style={{ display: 'block', objectFit: 'contain' }}
      />
    </div>
  );
}
