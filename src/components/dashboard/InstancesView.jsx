import { useEffect, useMemo, useState } from 'react';
import { Trash2, ExternalLink, Loader2, RefreshCw, Server, AlertCircle } from 'lucide-react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '@/lib/AuthContext';
import { firestore, functions } from '@/lib/firebaseClient';
import { verifyInstanceHealth } from '@/lib/onboardingService';

const FIREBASE_PROJECT_ID = 'freemi-3f7c7';
const FIREBASE_BILLING_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/usage/details`;

function isHostedWizard() {
  if (typeof window === 'undefined') return false;
  const hostname = window.location?.hostname || '';
  return hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.endsWith('.local');
}

const STATUS_STYLES = {
  healthy: 'bg-green-50 text-green-700 border-green-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  provisioning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  unverified: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
};

function deriveInstanceState(instance) {
  const status = instance.status || 'unknown';
  const healthCheck = instance.healthCheck || {};

  if (healthCheck.healthy === true || status === 'active') {
    return { key: 'healthy', label: 'healthy' };
  }

  if (status === 'failed' || status === 'verification_failed' || healthCheck.verificationState === 'failed') {
    return { key: 'failed', label: 'failed' };
  }

  if (status === 'active_unverified' || status === 'provisioned_unverified') {
    return { key: 'unverified', label: 'unverified' };
  }

  if (status === 'provisioning_started' || status === 'provisioned') {
    return { key: 'provisioning', label: 'provisioning' };
  }

  return { key: 'provisioning', label: status.replace(/_/g, ' ') };
}

export default function InstancesView() {
  const { user } = useAuth();
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (!user?.uid) {
      setInstances([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    const instancesQuery = query(
      collection(firestore, 'instances'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      instancesQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setInstances(Array.isArray(data) ? data : []);
        setLoading(false);
      },
      (error) => {
        console.error('Error subscribing to instances:', error);
        setInstances([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const handleRefreshStatus = async (instance) => {
    setActionLoading((prev) => ({ ...prev, [instance.id]: 'status' }));

    try {
      const result = await verifyInstanceHealth({
        onboardingSessionId: instance.onboardingSessionId || null,
        instanceId: instance.id,
        force: true,
      });

      if (!result?.success) {
        throw new Error(result?.error || 'Verification failed');
      }

      // Firestore subscription will hydrate the latest state automatically.
    } catch (error) {
      console.error('Status refresh error:', error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [instance.id]: null }));
    }
  };

  const handleDelete = async (instance) => {
    setActionLoading((prev) => ({ ...prev, [instance.id]: 'delete' }));

    try {
      const callable = httpsCallable(functions, 'deleteInstance');
      await callable({
        instanceId: instance.id,
        machineId: instance.machineId || null,
        volumeId: instance.volumeId || null,
      });
      setInstances((prev) => prev.filter((entry) => entry.id !== instance.id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete instance');
    } finally {
      setActionLoading((prev) => ({ ...prev, [instance.id]: null }));
    }
  };

  const runningCount = useMemo(
    () => instances.filter((instance) => deriveInstanceState(instance).key === 'healthy').length,
    [instances]
  );
  const showHostedBackendNotice = isHostedWizard();
  const hostedNoticeBody = !loading && instances.length > 0
    ? `This dashboard can render existing Firestore records, but new hosted deploys are still blocked until project ${FIREBASE_PROJECT_ID} has Blaze billing enabled and Firebase Functions deployed.`
    : `This dashboard is live, but project ${FIREBASE_PROJECT_ID} still needs Blaze billing enabled and Firebase Functions deployed before the wizard can create real Firestore-backed instances here.`;
  const headerBadge = showHostedBackendNotice
    ? {
        label: `${instances.length} records visible`,
        dotClassName: 'bg-amber-400',
        background: 'rgba(245,158,11,0.10)',
        color: '#B45309',
      }
    : {
        label: `${runningCount} healthy`,
        dotClassName: 'bg-green-400',
        background: 'rgba(91,95,255,0.06)',
        color: '#5B5FFF',
      };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}>
      <div className="flex items-center justify-between px-4 md:px-8 py-4 flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #E8EAFF' }}>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#0F172A' }}>My Instances</h1>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: headerBadge.background, color: headerBadge.color }}>
            <span className={`w-1.5 h-1.5 rounded-full ${headerBadge.dotClassName}`} />
            {headerBadge.label}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {showHostedBackendNotice && (
          <div
            className="mb-6 rounded-2xl px-4 py-3 flex items-start gap-3"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}
          >
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#B45309' }} />
            <div>
              <div className="text-sm font-semibold" style={{ color: '#92400E' }}>Hosted instances are still blocked on the Firebase backend</div>
              <div className="text-xs mt-1" style={{ color: '#B45309' }}>
                {hostedNoticeBody}
              </div>
              <a
                href={FIREBASE_BILLING_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold mt-2 underline"
                style={{ color: '#92400E' }}
              >
                Open Firebase billing / project settings
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5B5FFF' }} />
          </div>
        ) : instances.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
              <Server size={28} className="text-purple-400" />
            </div>
            <p className="text-gray-500 font-medium mb-1">No instances yet</p>
            <p className="text-gray-400 text-sm">
              {showHostedBackendNotice
                ? `This hosted dashboard cannot show real instances until project ${FIREBASE_PROJECT_ID} has Blaze billing enabled and Firebase Functions deployed.`
                : 'Complete the setup wizard to deploy your first AI operator.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 max-w-4xl">
            {instances.map((instance) => {
              const isLoading = actionLoading[instance.id];
              const derivedState = deriveInstanceState(instance);
              const displayName = instance.agentName || instance.answers?.agent_name || instance.agentType || instance.subdomain || 'Operator';

              return (
                <div key={instance.id} className="p-5 rounded-2xl border bg-white hover:shadow-md transition-all"
                  style={{ borderColor: '#E8EAFF' }}>
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{displayName}</h3>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${STATUS_STYLES[derivedState.key] || STATUS_STYLES.failed}`}>
                          {derivedState.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-gray-400">
                        <span>Region: {instance.deploymentProfile?.target?.region || 'iad'}</span>
                        <span>Plan: {instance.plan || '—'}</span>
                        {instance.machineId && <span>Machine: {instance.machineId}</span>}
                        {instance.url && (
                          <a href={instance.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium" style={{ color: '#5B5FFF' }}>
                            Open <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleRefreshStatus(instance)} disabled={!!isLoading}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40" title="Refresh status">
                        <RefreshCw size={14} className={`text-gray-400 ${isLoading === 'status' ? 'animate-spin' : ''}`} />
                      </button>
                      <button onClick={() => {
                        if (confirm('Delete this instance? This will destroy the machine and its data.')) {
                          handleDelete(instance);
                        }
                      }} disabled={!!isLoading}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40" title="Delete">
                        {isLoading === 'delete' ? <Loader2 size={14} className="animate-spin text-red-400" /> : <Trash2 size={14} className="text-red-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
