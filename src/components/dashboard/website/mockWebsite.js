// Mock sites — used when no real Firestore data exists
// Shape mirrors the `websites` Firestore collection
// Real Firestore IDs: Lauren O'Reilly → 7YPUFfSUXrIsMF7LjrBb, Wellness Script → IpQd3oVj6AALA0rBC8Oo
export const MOCK_SITES = [
  {
    id: '7YPUFfSUXrIsMF7LjrBb',
    userId: 'NHK2XlH09NOgtEBlPGUZjOPeNmF2',
    name: "Lauren O'Reilly",
    domain: 'itslaurenoreilly.web.app',
    status: 'live',
    publishedAt: new Date(Date.now() - 28 * 86400000),
    lastUpdated: new Date(Date.now() - 1 * 86400000),
    pageCount: 6,
    pagespeed: 98,
    seoScore: 94,
    primaryColor: '#EC4899',
  },
  {
    id: 'IpQd3oVj6AALA0rBC8Oo',
    userId: 'NHK2XlH09NOgtEBlPGUZjOPeNmF2',
    name: 'Wellness Script',
    domain: 'wellness-cript.web.app',
    status: 'live',
    publishedAt: new Date(Date.now() - 10 * 86400000),
    lastUpdated: new Date(Date.now() - 3 * 86400000),
    pageCount: 5,
    pagespeed: 95,
    seoScore: 88,
    primaryColor: '#0D9488',
  },
];

// Default mock site (for users with one site)
export const MOCK_SITE = MOCK_SITES[0];

export const MOCK_PAGES_BY_SITE = {
  '7YPUFfSUXrIsMF7LjrBb': [
    { id: 'home', title: 'Home',      slug: '/',         type: 'home',     status: 'published', views: 2341, seo: 97, lastEdited: new Date(Date.now() - 1 * 86400000),  sections: ['Hero', 'About', 'Services', 'Portfolio', 'Podcast', 'CTA'] },
    { id: 'p2', title: 'About',     slug: '/about',    type: 'about',    status: 'published', views: 891,  seo: 94, lastEdited: new Date(Date.now() - 4 * 86400000),  sections: ['Story', 'Values', 'Press'] },
    { id: 'p3', title: 'Services',  slug: '/services', type: 'services', status: 'published', views: 654,  seo: 91, lastEdited: new Date(Date.now() - 6 * 86400000),  sections: ['Service cards', 'Process', 'Pricing'] },
    { id: 'p4', title: 'Work',      slug: '/work',     type: 'services', status: 'published', views: 1204, seo: 91, lastEdited: new Date(Date.now() - 2 * 86400000),  sections: ['Portfolio grid', 'Case studies'] },
    { id: 'p5', title: 'Podcast',   slug: '/podcast',  type: 'blog',     status: 'published', views: 318,  seo: 88, lastEdited: new Date(Date.now() - 1 * 86400000),  sections: ['Episode player', 'Listen on', 'Newsletter'] },
    { id: 'p6', title: 'Contact',   slug: '/contact',  type: 'contact',  status: 'published', views: 743,  seo: 95, lastEdited: new Date(Date.now() - 7 * 86400000),  sections: ['Contact form', 'Socials'] },
  ],
  'IpQd3oVj6AALA0rBC8Oo': [
    { id: 'q1', title: 'Home',      slug: '/',          type: 'home',     status: 'published', views: 1102, seo: 93, lastEdited: new Date(Date.now() - 3 * 86400000),  sections: ['Hero', 'Podcast Stats', 'About the Show', 'Guest Experts', 'Platforms', 'CTA'] },
    { id: 'q2', title: 'Episodes',  slug: '/episodes',  type: 'blog',     status: 'published', views: 674,  seo: 87, lastEdited: new Date(Date.now() - 3 * 86400000),  sections: ['Episode player', 'Episode guides', 'Newsletter'] },
    { id: 'q3', title: 'Guests',    slug: '/guests',    type: 'about',    status: 'published', views: 412,  seo: 90, lastEdited: new Date(Date.now() - 8 * 86400000),  sections: ['Guest grid', 'Apply to be a guest'] },
    { id: 'q4', title: 'About',     slug: '/about',     type: 'about',    status: 'published', views: 389,  seo: 92, lastEdited: new Date(Date.now() - 5 * 86400000),  sections: ['About Lauren', 'About Podcast', 'Growth Vision'] },
    { id: 'q5', title: 'Contact',   slug: '/contact',   type: 'contact',  status: 'published', views: 211,  seo: 91, lastEdited: new Date(Date.now() - 5 * 86400000),  sections: ['Contact form', 'Sponsorship'] },
  ],
};

// Fallback for sites without a specific pages list
export const MOCK_PAGES = MOCK_PAGES_BY_SITE['7YPUFfSUXrIsMF7LjrBb'];

export const MOCK_TRAFFIC_BY_SITE = {
  '7YPUFfSUXrIsMF7LjrBb': [
    { day: 'Mon', visitors: 58 }, { day: 'Tue', visitors: 71 }, { day: 'Wed', visitors: 64 },
    { day: 'Thu', visitors: 89 }, { day: 'Fri', visitors: 102 }, { day: 'Sat', visitors: 76 }, { day: 'Sun', visitors: 83 },
  ],
  'IpQd3oVj6AALA0rBC8Oo': [
    { day: 'Mon', visitors: 32 }, { day: 'Tue', visitors: 41 }, { day: 'Wed', visitors: 38 },
    { day: 'Thu', visitors: 55 }, { day: 'Fri', visitors: 49 }, { day: 'Sat', visitors: 30 }, { day: 'Sun', visitors: 47 },
  ],
};

export const MOCK_LEADS_BY_SITE = {
  '7YPUFfSUXrIsMF7LjrBb': [
    { id: 'l1', name: 'Sophie Anderson',  email: 'sophie@andco.com.au',     page: 'Contact', time: new Date(Date.now() - 2 * 3600000),   message: 'Loved your portfolio — would love to work together.' },
    { id: 'l2', name: 'Marcus Webb',      email: 'marcus@webbgroup.com',    page: 'Work',    time: new Date(Date.now() - 7 * 3600000),   message: 'Can we discuss a branding project?' },
    { id: 'l3', name: 'Chloe Turner',     email: 'chloe@turnerpr.com',      page: 'Contact', time: new Date(Date.now() - 14 * 3600000),  message: 'Looking for a creative director for our campaign.' },
    { id: 'l4', name: 'Ethan Brooks',     email: 'ethan@brooksco.com.au',   page: 'Home',    time: new Date(Date.now() - 1 * 86400000),  message: 'Referred by a mutual friend — let\'s chat!' },
  ],
  'IpQd3oVj6AALA0rBC8Oo': [
    { id: 'm1', name: 'Natalie Stone',    email: 'nat@stonehealth.com',     page: 'Contact', time: new Date(Date.now() - 1 * 3600000),   message: 'Interested in sponsoring the podcast.' },
    { id: 'm2', name: 'James Holloway',   email: 'james@holloway.com.au',   page: 'Guests',  time: new Date(Date.now() - 5 * 3600000),   message: 'Would love to be a guest on Wellness Script.' },
    { id: 'm3', name: 'Ava Chen',         email: 'ava@chenwellness.com',    page: 'Contact', time: new Date(Date.now() - 22 * 3600000),  message: 'Big fan of the show — please cover breathwork.' },
  ],
};

export const MOCK_UPDATES_BY_SITE = {
  '7YPUFfSUXrIsMF7LjrBb': [
    { id: 'u1', type: 'update',  title: 'Portfolio section refreshed',       desc: 'New case studies added to Work page',        time: new Date(Date.now() - 1 * 86400000) },
    { id: 'u2', type: 'publish', title: 'Blog post published',               desc: '"My Creative Process" — live now',           time: new Date(Date.now() - 2 * 86400000) },
    { id: 'u3', type: 'seo',     title: 'SEO audit complete',                desc: 'All pages optimised, score lifted to 94',    time: new Date(Date.now() - 5 * 86400000) },
    { id: 'u4', type: 'speed',   title: 'PageSpeed 98/100',                  desc: 'Images optimised, fonts preloaded',          time: new Date(Date.now() - 10 * 86400000) },
    { id: 'u5', type: 'launch',  title: 'Site launched',                     desc: 'itslaurenoreilly.web.app is live',           time: new Date(Date.now() - 28 * 86400000) },
  ],
  'IpQd3oVj6AALA0rBC8Oo': [
    { id: 'v1', type: 'update',  title: 'Episode guide added',               desc: 'New episode guide for the mindfulness deep-dive', time: new Date(Date.now() - 3 * 86400000) },
    { id: 'v2', type: 'seo',     title: 'Podcast schema markup added',       desc: 'Rich results enabled for episode pages',     time: new Date(Date.now() - 4 * 86400000) },
    { id: 'v3', type: 'speed',   title: 'Performance improved to 95/100',    desc: 'Audio player optimised, lazy loading added', time: new Date(Date.now() - 7 * 86400000) },
    { id: 'v4', type: 'launch',  title: 'Site launched',                     desc: 'wellness-cript.web.app is live',            time: new Date(Date.now() - 10 * 86400000) },
  ],
};

export const MOCK_STATS_BY_SITE = {
  '7YPUFfSUXrIsMF7LjrBb': {
    visitorsMonth: 1247, visitorsMonthDelta: 18,
    pageViewsMonth: 5497, leadsMonth: 22, leadsDelta: 14,
    pagespeed: 98, seoScore: 94, uptime: 99.99, avgSessionSec: 174,
  },
  'IpQd3oVj6AALA0rBC8Oo': {
    visitorsMonth: 612, visitorsMonthDelta: 31,
    pageViewsMonth: 2577, leadsMonth: 11, leadsDelta: 22,
    pagespeed: 95, seoScore: 88, uptime: 99.97, avgSessionSec: 203,
  },
};
