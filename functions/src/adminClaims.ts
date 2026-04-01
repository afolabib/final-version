import * as functions from 'firebase-functions';
import { admin } from './firebase';

type SetAdminClaimsData = {
  uid?: string;
  email?: string;
  isAdmin?: boolean;
  role?: string;
};

const normalizeRole = (value: unknown) => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  return normalized || undefined;
};

const isAdminClaimSet = (claims: Record<string, unknown> = {}) => {
  const role = normalizeRole(claims.role);
  return claims.admin === true || claims.isAdmin === true || role === 'admin';
};

const resolveTargetUser = async ({ uid, email }: SetAdminClaimsData) => {
  if (typeof uid === 'string' && uid.trim()) {
    return admin.auth().getUser(uid.trim());
  }

  if (typeof email === 'string' && email.trim()) {
    return admin.auth().getUserByEmail(email.trim().toLowerCase());
  }

  throw new functions.https.HttpsError(
    'invalid-argument',
    'A target uid or email is required'
  );
};

export const setAdminClaims = functions.https.onCall(async (data: SetAdminClaimsData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const caller = await admin.auth().getUser(context.auth.uid);
  const callerClaims = caller.customClaims || {};

  if (!isAdminClaimSet(callerClaims)) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can manage admin claims');
  }

  const targetUser = await resolveTargetUser(data || {});
  const existingClaims = targetUser.customClaims || {};
  const requestedRole = normalizeRole(data?.role);
  const shouldBeAdmin = data?.isAdmin === true || requestedRole === 'admin';

  const nextClaims: Record<string, unknown> = {
    ...existingClaims,
  };

  if (shouldBeAdmin) {
    nextClaims.admin = true;
    nextClaims.isAdmin = true;
    nextClaims.role = 'admin';
  } else {
    delete nextClaims.admin;
    delete nextClaims.isAdmin;
    if (requestedRole && requestedRole !== 'admin') {
      nextClaims.role = requestedRole;
    } else if (normalizeRole(existingClaims.role) === 'admin') {
      delete nextClaims.role;
    }
  }

  await admin.auth().setCustomUserClaims(targetUser.uid, nextClaims);

  return {
    ok: true,
    uid: targetUser.uid,
    email: targetUser.email || '',
    claims: nextClaims,
    isAdmin: isAdminClaimSet(nextClaims),
  };
});
