import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getIdTokenResult, onIdTokenChanged, signOut } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebaseClient';

const AuthContext = createContext();

const resolveAdminRole = (_firebaseUser, claims = {}) => {
  const claimRole = typeof claims.role === 'string' ? claims.role.toLowerCase() : '';
  const isClaimAdmin = Boolean(
    claims.admin === true ||
    claims.isAdmin === true ||
    claimRole === 'admin'
  );

  if (isClaimAdmin) {
    return { isAdmin: true, role: 'admin', adminSource: 'custom-claims' };
  }

  return { isAdmin: false, role: claimRole || 'user', adminSource: 'none' };
};

const mapFirebaseUser = (firebaseUser, claims = {}) => {
  if (!firebaseUser) return null;

  const fullName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
  const adminRole = resolveAdminRole(firebaseUser, claims);

  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    full_name: fullName,
    display_name: firebaseUser.displayName || fullName,
    photo_url: firebaseUser.photoURL || null,
    isAnonymous: firebaseUser.isAnonymous,
    providerData: firebaseUser.providerData || [],
    claims,
    role: adminRole.role,
    isAdmin: adminRole.isAdmin,
    adminSource: adminRole.adminSource,
  };
};

// Guest user — used when auth is bypassed. UID matches Lauren's Firestore docs.
const GUEST_USER = {
  uid: 'NHK2XlH09NOgtEBlPGUZjOPeNmF2',
  email: 'lauren oreill7@gmail.com',
  full_name: "Lauren O'Reilly",
  displayName: "Lauren O'Reilly",
  isAdmin: true,
  role: 'admin',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({ auth_provider: 'firebase' });

  const syncFirebaseUser = useCallback(async (firebaseUser, options = {}) => {
    if (!firebaseUser) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      setIsLoadingAuth(false);
      return null;
    }

    try {
      const tokenResult = await getIdTokenResult(firebaseUser, options.forceRefresh === true);
      const mappedUser = mapFirebaseUser(firebaseUser, tokenResult?.claims || {});
      setUser(mappedUser);
      setIsAuthenticated(true);
      setAuthError(null);
      setIsLoadingAuth(false);
      return mappedUser;
    } catch (error) {
      console.error('Firebase token sync failed:', error);
      const fallbackUser = mapFirebaseUser(firebaseUser);
      setUser(fallbackUser);
      setIsAuthenticated(true);
      setAuthError({
        type: 'token_sync_failed',
        message: error?.message || 'Failed to sync authentication state',
      });
      setIsLoadingAuth(false);
      return fallbackUser;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(
      firebaseAuth,
      (firebaseUser) => {
        void syncFirebaseUser(firebaseUser);
      },
      (error) => {
        console.error('Firebase auth state listener failed:', error);
        setUser(null);
        setIsAuthenticated(false);
        setAuthError({
          type: 'auth_listener_failed',
          message: error?.message || 'Failed to initialize authentication',
        });
        setIsLoadingAuth(false);
      }
    );

    return () => unsubscribe();
  }, [syncFirebaseUser]);

  const refreshUserClaims = async () => syncFirebaseUser(firebaseAuth.currentUser, { forceRefresh: true });

  const checkAppState = async () => {
    setAuthError(null);
    const currentUser = firebaseAuth.currentUser;
    const resolvedUser = currentUser ? await syncFirebaseUser(currentUser) : null;

    return {
      user: resolvedUser,
      isAuthenticated: Boolean(currentUser),
      provider: 'firebase',
    };
  };

  const logout = async () => {
    try {
      await signOut(firebaseAuth);
    } catch (error) {
      console.error('Firebase logout failed:', error);
      setAuthError({
        type: 'logout_failed',
        message: error?.message || 'Failed to sign out',
      });
    }
  };

  const navigateToLogin = () => {
    window.location.assign('/dashboard/wizard');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState,
      refreshUserClaims,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
