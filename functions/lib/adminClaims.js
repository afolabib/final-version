"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAdminClaims = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./firebase");
const normalizeRole = (value) => {
    if (typeof value !== 'string')
        return undefined;
    const normalized = value.trim().toLowerCase();
    return normalized || undefined;
};
const isAdminClaimSet = (claims = {}) => {
    const role = normalizeRole(claims.role);
    return claims.admin === true || claims.isAdmin === true || role === 'admin';
};
const resolveTargetUser = async ({ uid, email }) => {
    if (typeof uid === 'string' && uid.trim()) {
        return firebase_1.admin.auth().getUser(uid.trim());
    }
    if (typeof email === 'string' && email.trim()) {
        return firebase_1.admin.auth().getUserByEmail(email.trim().toLowerCase());
    }
    throw new functions.https.HttpsError('invalid-argument', 'A target uid or email is required');
};
exports.setAdminClaims = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const caller = await firebase_1.admin.auth().getUser(context.auth.uid);
    const callerClaims = caller.customClaims || {};
    if (!isAdminClaimSet(callerClaims)) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can manage admin claims');
    }
    const targetUser = await resolveTargetUser(data || {});
    const existingClaims = targetUser.customClaims || {};
    const requestedRole = normalizeRole(data?.role);
    const shouldBeAdmin = data?.isAdmin === true || requestedRole === 'admin';
    const nextClaims = {
        ...existingClaims,
    };
    if (shouldBeAdmin) {
        nextClaims.admin = true;
        nextClaims.isAdmin = true;
        nextClaims.role = 'admin';
    }
    else {
        delete nextClaims.admin;
        delete nextClaims.isAdmin;
        if (requestedRole && requestedRole !== 'admin') {
            nextClaims.role = requestedRole;
        }
        else if (normalizeRole(existingClaims.role) === 'admin') {
            delete nextClaims.role;
        }
    }
    await firebase_1.admin.auth().setCustomUserClaims(targetUser.uid, nextClaims);
    return {
        ok: true,
        uid: targetUser.uid,
        email: targetUser.email || '',
        claims: nextClaims,
        isAdmin: isAdminClaimSet(nextClaims),
    };
});
