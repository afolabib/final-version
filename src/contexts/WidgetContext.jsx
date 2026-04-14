import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/AuthContext';

// ── Default widget configs (used when Firestore has no widget docs) ───────────
// Keyed by widget ID — edit these to populate real client data.
// To add a new client: push a Firestore `widgets` doc with `userId` set to their
// Firebase UID, or add a fallback entry here with their siteId as the key.

export const MOCK_WIDGETS = [
  {
    id: 'lauren-widget-1',
    userId: '__mock__',
    businessName: "Lauren O'Reilly",
    botName: 'Freemi',
    greeting: "Hi! I'm Lauren's AI assistant — ask me about bookings, speaking, brand partnerships, or the podcast 👋",
    primaryColor: '#C1122F',
    personality: ['friendly', 'professional'],
    tone: 'balanced',
    capabilities: ['bookings', 'enquiries', 'leads'],
    customInstructions: "Lauren O'Reilly is a content creator, speaker, podcast host, and brand consultant. She offers speaking engagements, media collaborations, brand partnerships, podcast guesting, and consulting services. Her podcast is 'The Wellness Script'. Visitors can book a discovery call via her website. Email contact: hello@laurenoreilly.com.",
    active: true,
    site: 'itslaurenoreilly.web.app',
    siteName: "Lauren O'Reilly",
  },
  {
    id: 'lauren-widget-2',
    userId: '__mock__',
    businessName: 'Wellness Script',
    botName: 'Wellness Script Concierge',
    greeting: "Hi! Ask me anything about The Wellness Script podcast 🎙️",
    primaryColor: '#C1122F',
    personality: ['friendly', 'energetic'],
    tone: 'balanced',
    capabilities: ['enquiries', 'support'],
    customInstructions: "The Wellness Script is a podcast hosted by Lauren O'Reilly covering wellness, mindset, and personal growth. Episodes are released weekly and available on Spotify, Apple Podcasts, and all major platforms. Sponsorship packages start at €2,500/season. Guests can apply to appear on the podcast via the website. For general enquiries contact hello@thewellnessscript.com.",
    active: true,
    site: 'wellness-cript.web.app',
    siteName: 'Wellness Script',
  },
];

// ─────────────────────────────────────────────────────────────────────────────

const WidgetContext = createContext({
  widgets: [],
  activeWidget: null,
  activeWidgetId: null,
  setActiveWidgetId: () => {},
  loading: true,
});

export function useWidget() {
  return useContext(WidgetContext);
}

export function WidgetProvider({ children }) {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState([]);
  const [activeWidgetId, setActiveWidgetId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    // Try querying all widget docs belonging to this user
    const q = query(
      collection(firestore, 'widgets'),
      where('userId', '==', user.uid),
    );

    const unsub = onSnapshot(
      q,
      snap => {
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Legacy: also check for the old single-widget doc at widgets/{uid}
        // That doc won't appear in the userId query because its userId field
        // is set to the uid itself. We merge it in if present.
        // (handled by the doc itself having userId == user.uid — should appear)

        // Fall back to mock if no real docs
        if (docs.length === 0) docs = MOCK_WIDGETS;

        setWidgets(docs);
        setActiveWidgetId(prev => {
          if (prev && docs.find(d => d.id === prev)) return prev;
          return docs[0]?.id || null;
        });
        setLoading(false);
      },
      () => {
        setWidgets(MOCK_WIDGETS);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [user?.uid]);

  const activeWidget = widgets.find(w => w.id === activeWidgetId) || widgets[0] || null;

  return (
    <WidgetContext.Provider value={{ widgets, activeWidget, activeWidgetId, setActiveWidgetId, loading }}>
      {children}
    </WidgetContext.Provider>
  );
}
