/**
 * Audit Log Service — EcoTrack AI (Phase 6)
 * Logs all administrative actions with timestamp, admin identity, action type, and target.
 */

import { db } from '../firebase/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { AuditAction, AuditLogEntry } from '../types/rbac';

/** Writes an audit log entry to Firestore. */
export async function logAuditAction(
  adminUid: string,
  adminEmail: string,
  action: AuditAction,
  target: string,
  details: Record<string, any> = {}
): Promise<void> {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      adminUid,
      adminEmail,
      action,
      target,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    // Audit log failures must not crash the main operation — log to console only
    console.error('[AuditLog] Failed to write audit entry:', action, target, err);
  }
}

/** Retrieves recent audit logs (admin-only). */
export async function getRecentAuditLogs(maxResults: number = 100): Promise<AuditLogEntry[]> {
  try {
    const q = query(
      collection(db, 'audit_logs'),
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      timestamp: d.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as AuditLogEntry));
  } catch {
    return [];
  }
}

/** Retrieves audit logs for a specific admin user. */
export async function getAuditLogsByAdmin(adminUid: string, maxResults: number = 50): Promise<AuditLogEntry[]> {
  try {
    const q = query(
      collection(db, 'audit_logs'),
      where('adminUid', '==', adminUid),
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      timestamp: d.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as AuditLogEntry));
  } catch {
    return [];
  }
}
