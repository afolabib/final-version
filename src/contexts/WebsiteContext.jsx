import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/AuthContext';
import { MOCK_SITES } from '@/components/dashboard/website/mockWebsite';

const WebsiteContext = createContext({
  sites: [],
  activeSite: null,
  activeSiteId: null,
  setActiveSiteId: () => {},
  loading: true,
  pages: [],
  pagesLoading: true,
});

export function useWebsite() {
  return useContext(WebsiteContext);
}

export function WebsiteProvider({ children }) {
  const { user } = useAuth();
  const [sites, setSites] = useState([]);
  const [activeSiteId, setActiveSiteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(false);

  // Load all sites for this user
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(firestore, 'websites'),
      where('userId', '==', user.uid),
    );
    const unsub = onSnapshot(q, snap => {
      let docs = snap.docs.map(d => {
        const firestoreData = { id: d.id, ...d.data() };
        const mockFallback = MOCK_SITES.find(s => s.id === d.id) || {};
        return { ...mockFallback, ...firestoreData };
      });
      // No real Firestore sites — fall back to mock data so the UI always has data
      if (docs.length === 0) docs = MOCK_SITES;
      setSites(docs);
      setActiveSiteId(prev => {
        if (prev && docs.find(d => d.id === prev)) return prev;
        return docs[0]?.id || null;
      });
      setLoading(false);
    }, (err) => { console.error('[WebsiteCtx] Firestore error:', err); setLoading(false); });
    return () => unsub();
  }, [user?.uid]);

  // Load pages for the active site
  useEffect(() => {
    if (!activeSiteId) { setPages([]); return; }
    setPagesLoading(true);
    const unsub = onSnapshot(
      collection(firestore, 'websites', activeSiteId, 'pages'),
      snap => {
        const docs = snap.docs.map(d => {
          const data = d.data();
          // Normalise lastEdited — Firestore Timestamp or already a Date/string
          const lastEdited = data.lastEdited?.toDate
            ? data.lastEdited.toDate()
            : data.lastEdited ? new Date(data.lastEdited) : null;
          return { id: d.id, ...data, lastEdited };
        });
        // Sort by view count descending so highest-traffic pages appear first
        docs.sort((a, b) => (b.views || 0) - (a.views || 0));
        setPages(docs);
        setPagesLoading(false);
      },
      () => { setPages([]); setPagesLoading(false); },
    );
    return () => unsub();
  }, [activeSiteId]);

  const activeSite = sites.find(s => s.id === activeSiteId) || sites[0] || null;

  return (
    <WebsiteContext.Provider value={{ sites, activeSite, activeSiteId, setActiveSiteId, loading, pages, pagesLoading }}>
      {children}
    </WebsiteContext.Provider>
  );
}
