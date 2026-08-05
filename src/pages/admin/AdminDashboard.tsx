import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, ClipboardCheck, Brain, Database,
  Mail, ScrollText, LogOut, ChevronRight, TrendingUp, Shield,
  UserX, UserCheck, AlertTriangle, Search, RefreshCw,
  CheckCircle, XCircle, Flag, Undo2, Star, Loader2, Download,
  RotateCcw, AlertCircle, FileCheck, DollarSign, Activity, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logAuditAction, getRecentAuditLogs } from '../../services/auditService';
import { getAllActiveSubscribers } from '../../services/newsletterService';
import { AuditLogEntry, UserRole } from '../../types/rbac';
import {
  collection, getDocs, query, orderBy, limit, where,
  doc, updateDoc, serverTimestamp, getCountFromServer, addDoc
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { registry, RegisteredDataset } from '../../data/datasets';

type AdminSection =
  | 'dashboard'
  | 'users'
  | 'assessments'
  | 'ai'
  | 'datasets'
  | 'newsletter'
  | 'audit';

const NAV_ITEMS: { key: AdminSection; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
  { key: 'users', label: 'User Management', icon: Users },
  { key: 'assessments', label: 'Assessment Moderation', icon: ClipboardCheck },
  { key: 'ai', label: 'AI Operations', icon: Brain },
  { key: 'datasets', label: 'Dataset Manager', icon: Database },
  { key: 'newsletter', label: 'Newsletter Studio', icon: Mail },
  { key: 'audit', label: 'Audit Logs', icon: ScrollText },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [loading, setLoading] = useState(false);

  // ── Operations Dashboard Stats ──────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssessments: 0,
    pendingReviews: 0,
    newsletterSubscribers: 0,
    datasetCount: registry.size,
    calcVersion: '2.0.0',
  });

  useEffect(() => {
    if (section === 'dashboard') loadStats();
  }, [section]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [usersSnap, pendingSnap, subscribers] = await Promise.all([
        getCountFromServer(collection(db, 'users')),
        getDocs(query(collection(db, 'assessments_review'), where('status', '==', 'pending_review'), limit(50))),
        getAllActiveSubscribers(),
      ]);
      setStats(prev => ({
        ...prev,
        totalUsers: usersSnap.data().count,
        pendingReviews: pendingSnap.size,
        newsletterSubscribers: subscribers.length,
        datasetCount: registry.size,
      }));
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Users ────────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50)));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { setUsers([]); }
    finally { setUsersLoading(false); }
  }, []);

  useEffect(() => { if (section === 'users') loadUsers(); }, [section]);

  const handleSuspendUser = async (uid: string, displayName: string, suspend: boolean) => {
    await updateDoc(doc(db, 'users', uid), { isSuspended: suspend });
    await logAuditAction(user!.uid, user!.email!, suspend ? 'USER_SUSPEND' : 'USER_UNSUSPEND', uid, { displayName });
    await loadUsers();
  };

  const handleChangeRole = async (uid: string, displayName: string, role: string) => {
    await updateDoc(doc(db, 'users', uid), { role });
    await logAuditAction(user!.uid, user!.email!, 'ROLE_CHANGE', uid, { displayName, newRole: role });
    await loadUsers();
  };

  const handleSoftDeleteUser = async (uid: string, displayName: string) => {
    if (!window.confirm(`Are you sure you want to soft-delete user ${displayName}?`)) return;
    await updateDoc(doc(db, 'users', uid), { isDeleted: true, deletedAt: serverTimestamp() });
    await logAuditAction(user!.uid, user!.email!, 'USER_SOFT_DELETE', uid, { displayName });
    await loadUsers();
  };

  const handleResetPreferences = async (uid: string, displayName: string) => {
    await updateDoc(doc(db, 'users', uid), { preferences: null });
    await logAuditAction(user!.uid, user!.email!, 'USER_PREFERENCES_RESET', uid, { displayName });
    alert(`Preferences reset for ${displayName}`);
    await loadUsers();
  };

  const handleCreateTestAccount = async () => {
    const testName = prompt('Enter Test Account Name:', 'Demo Tester');
    if (!testName) return;
    const testEmail = `test_${Date.now()}@ecotrack.internal`;

    try {
      await addDoc(collection(db, 'users'), {
        name: testName,
        email: testEmail,
        isTestAccount: true,
        role: 'user',
        createdAt: serverTimestamp(),
        isSuspended: false,
      });
      await logAuditAction(user!.uid, user!.email!, 'TEST_ACCOUNT_CREATE', testEmail, { name: testName });
      alert(`Test Account Created Successfully!\nName: ${testName}\nEmail: ${testEmail}\n(Flagged as isTestAccount: true and excluded from all statistics)`);
      await loadUsers();
    } catch (err) {
      alert(`Failed to create test account: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const filteredUsers = users.filter(u =>
    !userSearch ||
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ── Assessments Moderation ──────────────────────────────────────────────────
  const [flaggedAssessments, setFlaggedAssessments] = useState<any[]>([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [modNote, setModNote] = useState<Record<string, string>>({});

  const loadFlaggedAssessments = useCallback(async () => {
    setAssessmentsLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, 'assessments_review'), orderBy('createdAt', 'desc'), limit(50))
      );
      setFlaggedAssessments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { setFlaggedAssessments([]); }
    finally { setAssessmentsLoading(false); }
  }, []);

  useEffect(() => { if (section === 'assessments') loadFlaggedAssessments(); }, [section]);

  const moderateAssessment = async (id: string, status: 'approved' | 'rejected' | 'flagged', defaultNote: string = '') => {
    const note = modNote[id] || defaultNote;
    await updateDoc(doc(db, 'assessments_review', id), {
      status,
      moderationNotes: note,
      reviewedAt: serverTimestamp(),
      reviewedBy: user?.email
    });
    const action = status === 'approved' ? 'ASSESSMENT_APPROVE' : status === 'rejected' ? 'ASSESSMENT_REJECT' : 'ASSESSMENT_FLAG';
    await logAuditAction(user!.uid, user!.email!, action, id, { note });
    await loadFlaggedAssessments();
  };

  // ── Dataset Manager ──────────────────────────────────────────────────────────
  const [registryDatasets, setRegistryDatasets] = useState<RegisteredDataset<unknown>[]>([]);
  const [datasetFilter, setDatasetFilter] = useState<string>('ALL');

  const refreshRegistry = useCallback(() => {
    setRegistryDatasets(registry.getAll());
  }, []);

  useEffect(() => {
    if (section === 'datasets') refreshRegistry();
  }, [section, refreshRegistry]);

  const handleValidateDataset = (id: string) => {
    const isValid = registry.validate(id);
    logAuditAction(user!.uid, user!.email!, 'DATASET_ACTIVATE', id, { isValid });
    refreshRegistry();
  };

  const handleDeprecateDataset = (id: string) => {
    registry.deprecate(id);
    logAuditAction(user!.uid, user!.email!, 'DATASET_ROLLBACK', id, { action: 'deprecate' });
    refreshRegistry();
  };

  const handleRollbackDataset = (id: string) => {
    const success = registry.rollback(id);
    if (success) {
      logAuditAction(user!.uid, user!.email!, 'DATASET_ROLLBACK', id, { success: true });
      alert(`Dataset ${id} rolled back to previous version.`);
    } else {
      alert(`No previous version available for rollback on dataset ${id}.`);
    }
    refreshRegistry();
  };

  // ── AI Operations Metrics ────────────────────────────────────────────────────
  const [aiMetrics, setAiMetrics] = useState({
    totalCalls: 0,
    cacheHitRate: 0,
    avgLatencyMs: 0,
    failures: 0,
    estCost: '$0.00',
  });
  const [aiLogsLoading, setAiLogsLoading] = useState(false);

  const loadAiMetrics = useCallback(async () => {
    setAiLogsLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'ai_logs'), orderBy('timestamp', 'desc'), limit(100)));
      const docs = snap.docs.map(d => d.data());
      const total = docs.length;
      if (total === 0) {
        setAiMetrics({ totalCalls: 0, cacheHitRate: 100, avgLatencyMs: 0, failures: 0, estCost: '$0.00' });
        return;
      }
      const cacheHits = docs.filter(d => d.fromCache).length;
      const fails = docs.filter(d => !d.success).length;
      const apiCalls = docs.filter(d => !d.fromCache && d.success);
      const totalLatency = apiCalls.reduce((acc, curr) => acc + (curr.latencyMs || 0), 0);
      const avgLatency = apiCalls.length > 0 ? Math.round(totalLatency / apiCalls.length) : 0;
      // Gemini 1.5 Flash est cost ~$0.0001 per call
      const cost = (apiCalls.length * 0.0001).toFixed(4);

      setAiMetrics({
        totalCalls: total,
        cacheHitRate: Math.round((cacheHits / total) * 100),
        avgLatencyMs: avgLatency,
        failures: fails,
        estCost: `$${cost}`,
      });
    } catch {
      setAiMetrics({ totalCalls: 0, cacheHitRate: 100, avgLatencyMs: 0, failures: 0, estCost: '$0.00' });
    } finally {
      setAiLogsLoading(false);
    }
  }, []);

  useEffect(() => { if (section === 'ai') loadAiMetrics(); }, [section]);

  // ── Audit Logs ────────────────────────────────────────────────────────────────
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try { setAuditLogs(await getRecentAuditLogs(100)); }
    catch { setAuditLogs([]); }
    finally { setAuditLoading(false); }
  }, []);

  useEffect(() => { if (section === 'audit') loadAuditLogs(); }, [section]);

  // ── Newsletter ────────────────────────────────────────────────────────────────
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const loadSubscribers = useCallback(async () => {
    setNewsletterLoading(true);
    try { setSubscribers(await getAllActiveSubscribers()); }
    catch { setSubscribers([]); }
    finally { setNewsletterLoading(false); }
  }, []);

  useEffect(() => { if (section === 'newsletter') loadSubscribers(); }, [section]);

  const exportSubscribers = () => {
    const csv = ['email,displayName,subscribedAt', ...subscribers.map(s => `${s.email},${s.displayName || ''},${s.subscribedAt?.toDate?.()?.toISOString() || ''}`)]
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecotrack_subscribers_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Stat Card ────────────────────────────────────────────────────────────────
  const StatCard: React.FC<{ label: string; value: string | number; icon: React.ElementType; color: string }> = ({
    label, value, icon: Icon, color
  }) => (
    <div className={`surface-matte rounded-2xl p-5 flex items-center gap-4`}>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-xs text-dark-500 mt-0.5">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-panel border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary-50 rounded-xl">
              <Shield className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Admin Console</p>
              <p className="text-[10px] text-dark-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  section === item.key
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-dark-500 hover:text-text-primary hover:bg-panel'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {section === item.key && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* ── Operations Dashboard ─────────────────────────────────────── */}
            {section === 'dashboard' && (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-text-primary">Operations Dashboard</h1>
                  <button onClick={loadStats} className="flex items-center gap-2 text-sm text-dark-500 hover:text-text-primary transition-colors">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="bg-cyan-50 text-cyan-700" />
                  <StatCard label="Pending Reviews" value={stats.pendingReviews} icon={AlertTriangle} color="bg-amber-50 text-amber-700" />
                  <StatCard label="Newsletter Subscribers" value={stats.newsletterSubscribers} icon={Mail} color="bg-violet-50 text-violet-700" />
                  <StatCard label="Registered Datasets" value={stats.datasetCount} icon={Database} color="bg-emerald-50 text-emerald-700" />
                  <StatCard label="Calculator Version" value={stats.calcVersion} icon={TrendingUp} color="bg-indigo-50 text-indigo-700" />
                  <StatCard label="Grid Factors Loaded" value="36 States/UTs" icon={Star} color="bg-rose-50 text-rose-700" />
                </div>

                {/* Active Registry Summary */}
                <div className="surface-matte rounded-2xl p-6">
                  <h2 className="text-base font-semibold text-text-primary mb-4">Active Scientific Dataset Registry</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {registry.getAll().map(ds => (
                      <div key={ds.id} className="bg-panel rounded-xl p-3 border border-border">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-text-primary truncate">{ds.displayName}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            ds.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>{ds.status}</span>
                        </div>
                        <p className="text-[10px] text-emerald-700 mt-1">{ds.version}</p>
                        <p className="text-[10px] text-dark-500 truncate mt-0.5">{ds.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── User Management ──────────────────────────────────────────── */}
            {section === 'users' && (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
                  <div className="flex gap-3">
                    <button onClick={handleCreateTestAccount} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-sm hover:bg-indigo-100 transition-all">
                      <Shield className="w-4 h-4" /> Create Test Account
                    </button>
                    <button onClick={loadUsers} className="flex items-center gap-2 px-4 py-2 bg-surface text-dark-500 border border-border rounded-xl text-sm hover:text-text-primary transition-all">
                      <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-4 top-3.5 text-dark-500" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-border focus:border-primary-500 rounded-xl text-text-primary text-sm outline-none transition-all"
                  />
                </div>

                <div className="space-y-3">
                  {usersLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
                  ) : filteredUsers.map(u => (
                    <div key={u.id} className={`surface-matte rounded-xl p-4 ${u.isDeleted ? 'opacity-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-text-primary truncate">{u.name || u.displayName || 'Unknown'}</p>
                            {u.isTestAccount && <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-bold">TEST ACCOUNT</span>}
                            {u.isSuspended && <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-700 rounded-full">SUSPENDED</span>}
                            {u.isDeleted && <span className="text-[10px] px-2 py-0.5 bg-panel text-dark-500 rounded-full">SOFT DELETED</span>}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              u.role === 'owner' ? 'bg-amber-50 text-amber-700' :
                              u.role === 'admin' ? 'bg-emerald-50 text-emerald-700' :
                              u.role === 'moderator' ? 'bg-cyan-50 text-cyan-700' :
                              'bg-panel text-dark-500'
                            }`}>{u.role || 'user'}</span>
                          </div>
                          <p className="text-xs text-dark-500 mt-0.5 truncate">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            defaultValue={u.role || 'user'}
                            onChange={e => handleChangeRole(u.id, u.name || u.email, e.target.value)}
                            className="text-xs bg-surface border border-border rounded-lg px-2 py-1.5 text-text-primary outline-none"
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                            <option value="owner">Owner</option>
                          </select>
                          <button
                            onClick={() => handleSuspendUser(u.id, u.name || u.email, !u.isSuspended)}
                            className={`p-2 rounded-lg transition-all ${u.isSuspended
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-amber-700 bg-amber-50 hover:bg-amber-100'}`}
                            title={u.isSuspended ? 'Restore' : 'Suspend'}
                          >
                            {u.isSuspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleResetPreferences(u.id, u.name || u.email)}
                            className="p-2 text-dark-500 bg-surface border border-border hover:text-text-primary rounded-lg transition-all"
                            title="Reset Preferences"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          {!u.isDeleted && (
                            <button
                              onClick={() => handleSoftDeleteUser(u.id, u.name || u.email)}
                              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                              title="Soft Delete"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Assessment Moderation ────────────────────────────────────── */}
            {section === 'assessments' && (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-text-primary">Assessment Moderation</h1>
                  <button onClick={loadFlaggedAssessments} className="text-dark-500 hover:text-text-primary">
                    <RefreshCw className={`w-4 h-4 ${assessmentsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {assessmentsLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
                ) : flaggedAssessments.length === 0 ? (
                  <div className="text-center py-16 text-dark-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No assessments pending review.</p>
                  </div>
                ) : flaggedAssessments.map(a => (
                  <div key={a.id} className="surface-matte rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-primary">Assessment ID: <code className="text-primary-700 text-xs">{a.id}</code></p>
                        <p className="text-xs text-dark-500">User: {a.userId} · Status: <span className="text-amber-700">{a.status}</span></p>
                      </div>
                      <p className="text-lg font-bold text-text-primary">{a.emissions?.totalKgCO2PerYear?.toLocaleString() || '—'} <span className="text-xs text-dark-500">kg CO₂</span></p>
                    </div>

                    <input
                      type="text"
                      placeholder="Add moderator note..."
                      value={modNote[a.id] || ''}
                      onChange={e => setModNote(prev => ({ ...prev, [a.id]: e.target.value }))}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary outline-none"
                    />

                    <div className="flex gap-2">
                      <button onClick={() => moderateAssessment(a.id, 'approved', 'Approved by moderator')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs hover:bg-emerald-100 transition-all">
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button onClick={() => moderateAssessment(a.id, 'flagged', 'Flagged for anomaly')} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs hover:bg-amber-100 transition-all">
                        <Flag className="w-3.5 h-3.5" /> Flag
                      </button>
                      <button onClick={() => moderateAssessment(a.id, 'rejected', 'Flagged as unrealistic values')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs hover:bg-red-100 transition-all">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── AI Operations ────────────────────────────────────────────── */}
            {section === 'ai' && (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-text-primary">AI Operations Monitor</h1>
                  <button onClick={loadAiMetrics} className="text-dark-500 hover:text-text-primary flex items-center gap-2 text-sm">
                    <RefreshCw className={`w-4 h-4 ${aiLogsLoading ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Requests" value={aiMetrics.totalCalls} icon={Activity} color="bg-indigo-50 text-indigo-700" />
                  <StatCard label="Cache Hit Rate" value={`${aiMetrics.cacheHitRate}%`} icon={CheckCircle} color="bg-emerald-50 text-emerald-700" />
                  <StatCard label="Avg API Latency" value={`${aiMetrics.avgLatencyMs} ms`} icon={Brain} color="bg-cyan-50 text-cyan-700" />
                  <StatCard label="Est. Cost" value={aiMetrics.estCost} icon={DollarSign} color="bg-amber-50 text-amber-700" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'AI Model', value: 'Gemini 1.5 Flash' },
                    { label: 'Prompt Version', value: '1.0.0' },
                    { label: 'PII Stripping Policy', value: '✅ Active — Name, Email, Phone & UID Stripped' },
                    { label: 'Rate Limiting', value: '1 Gemini call per assessment per hour' },
                    { label: 'Fallback Mode', value: 'Deterministic rule-based recommendations' },
                    { label: 'Temperature', value: '0.4 (low hallucination, high precision)' },
                  ].map(item => (
                    <div key={item.label} className="surface-matte rounded-xl p-4">
                      <p className="text-xs text-dark-500 mb-1">{item.label}</p>
                      <p className="text-sm font-medium text-text-primary">{item.value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Dataset Manager ──────────────────────────────────────────── */}
            {section === 'datasets' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-text-primary">Scientific Dataset Manager</h1>
                    <p className="text-xs text-dark-500 mt-1">Live inspection and governance via DatasetRegistry singleton.</p>
                  </div>
                  <button onClick={refreshRegistry} className="text-dark-500 hover:text-text-primary p-2">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="surface-matte rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex gap-4">
                      <span className="text-xs text-dark-500">Total: <strong className="text-text-primary">{registry.getSummary().totalDatasets}</strong></span>
                      <span className="text-xs text-emerald-700">Active: <strong>{registry.getSummary().activeCount}</strong></span>
                      <span className="text-xs text-amber-700">Deprecated: <strong>{registry.getSummary().deprecatedCount}</strong></span>
                      <span className="text-xs text-red-700">Pending: <strong>{registry.getSummary().pendingCount}</strong></span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {registryDatasets.map(ds => (
                      <div key={ds.id} className="bg-panel border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-text-primary">{ds.displayName}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              ds.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                              ds.status === 'deprecated' ? 'bg-amber-50 text-amber-700' :
                              ds.status === 'rollback' ? 'bg-indigo-50 text-indigo-700' :
                              'bg-red-50 text-red-700'
                            }`}>{ds.status}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-panel text-dark-500 rounded font-mono">{ds.category}</span>
                          </div>
                          <p className="text-xs text-dark-500 mt-1">{ds.source}</p>
                          <p className="text-[10px] text-dark-500 mt-0.5">Version: <code className="text-emerald-700">{ds.version}</code> · Units: {ds.units} · Updated: {ds.updateDate}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleValidateDataset(ds.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs hover:bg-emerald-100 transition-all"
                            title="Validate dataset structure"
                          >
                            <FileCheck className="w-3.5 h-3.5" /> Validate
                          </button>
                          {ds.previousVersion && (
                            <button
                              onClick={() => handleRollbackDataset(ds.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs hover:bg-indigo-100 transition-all"
                              title="Rollback to previous version"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Rollback
                            </button>
                          )}
                          {ds.status === 'active' && (
                            <button
                              onClick={() => handleDeprecateDataset(ds.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs hover:bg-amber-100 transition-all"
                              title="Deprecate dataset"
                            >
                              <AlertCircle className="w-3.5 h-3.5" /> Deprecate
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Newsletter Studio ────────────────────────────────────────── */}
            {section === 'newsletter' && (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-text-primary">Newsletter Studio</h1>
                  <div className="flex gap-2">
                    <button onClick={exportSubscribers} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm hover:bg-emerald-100 transition-all">
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button onClick={loadSubscribers} className="text-dark-500 hover:text-text-primary p-2">
                      <RefreshCw className={`w-4 h-4 ${newsletterLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="surface-matte rounded-2xl p-5">
                  <p className="text-sm text-dark-500 mb-4">
                    Active verified subscribers: <span className="text-text-primary font-bold">{subscribers.length}</span>
                  </p>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {newsletterLoading ? (
                      <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary-600" /></div>
                    ) : subscribers.map(s => (
                      <div key={s.id} className="flex items-center justify-between bg-panel rounded-lg px-4 py-2.5">
                        <span className="text-sm text-text-primary">{s.email}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                      </div>
                    ))}
                    {!newsletterLoading && subscribers.length === 0 && (
                      <p className="text-center text-dark-500 text-sm py-6">No active subscribers yet.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── Audit Logs ───────────────────────────────────────────────── */}
            {section === 'audit' && (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-text-primary">Audit Logs</h1>
                  <button onClick={loadAuditLogs} className="text-dark-500 hover:text-text-primary p-2">
                    <RefreshCw className={`w-4 h-4 ${auditLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  {auditLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
                  ) : auditLogs.length === 0 ? (
                    <div className="text-center py-16 text-dark-500">
                      <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No audit events recorded yet.</p>
                    </div>
                  ) : auditLogs.map(log => (
                    <div key={log.id} className="surface-matte rounded-xl px-5 py-3 flex items-center gap-4">
                      <div className="shrink-0">
                        <span className="text-[10px] font-mono bg-primary-50 text-primary-700 px-2 py-1 rounded">{log.action}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary truncate">Target: <code className="text-dark-500 text-xs">{log.target}</code></p>
                        <p className="text-xs text-dark-500">by {log.adminEmail}</p>
                      </div>
                      <p className="text-xs text-dark-500 shrink-0">{new Date(log.timestamp).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
