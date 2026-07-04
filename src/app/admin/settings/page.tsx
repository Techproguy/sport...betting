'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings2,
  SlidersHorizontal,
  ToggleRight,
  Users,
  KeyRound,
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Pencil,
  Trash2,
  Plus,
  X,
} from 'lucide-react';

import { AdminPage } from '@/components/admin/AdminPage';
import { DataTable, StatusPill, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Label, Select } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/misc';
import { Tabs } from '@/components/ui/tabs';
import { toast } from '@/store/toast';
import { db } from '@/lib/mock/db';
import { formatDateTime } from '@/lib/utils';
import type { AdminUser } from '@/lib/types';

type FlagKey = 'liveBetting' | 'cashOut' | 'sgp' | 'casino' | 'maintenance';

interface FeatureFlag {
  key: FlagKey;
  label: string;
  description: string;
}

const FEATURE_FLAGS: FeatureFlag[] = [
  { key: 'liveBetting', label: 'Live betting', description: 'Allow in-play wagers on live events.' },
  { key: 'cashOut', label: 'Cash out', description: 'Let users settle open bets early for a partial return.' },
  { key: 'sgp', label: 'Same-game parlay', description: 'Combine multiple markets from one event into a single bet.' },
  { key: 'casino', label: 'Casino (coming soon)', description: 'Slots and table games. Not yet live in production.' },
  { key: 'maintenance', label: 'Maintenance mode', description: 'Take the platform offline for scheduled maintenance.' },
];

const SECTIONS = [
  { value: 'general', label: 'General', icon: <Settings2 className="h-4 w-4" /> },
  { value: 'limits', label: 'Betting limits', icon: <SlidersHorizontal className="h-4 w-4" /> },
  { value: 'flags', label: 'Feature flags', icon: <ToggleRight className="h-4 w-4" /> },
  { value: 'team', label: 'Admin team', icon: <Users className="h-4 w-4" /> },
  { value: 'keys', label: 'API keys', icon: <KeyRound className="h-4 w-4" /> },
];

const ROLES: AdminUser['role'][] = ['Super Admin', 'Risk Manager', 'Support', 'Finance', 'Compliance'];

function roleVariant(role: string): 'primary' | 'info' | 'warning' | 'success' | 'default' {
  switch (role) {
    case 'Super Admin':
      return 'primary';
    case 'Risk Manager':
      return 'warning';
    case 'Finance':
      return 'success';
    case 'Compliance':
      return 'info';
    default:
      return 'default';
  }
}

function SectionCard({
  id,
  icon,
  title,
  description,
  onSave,
  children,
  index,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  onSave?: () => void;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="scroll-mt-24 rounded-lg border border-border bg-card"
    >
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-elevated text-primary">
            {icon}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-secondary">{description}</p>
          </div>
        </div>
        {onSave && (
          <Button size="sm" onClick={onSave} className="flex-shrink-0">
            Save
          </Button>
        )}
      </div>
      <div className="p-5">{children}</div>
    </motion.section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function NumberField({
  label,
  prefix,
  suffix,
  value,
  onChange,
}: {
  label: string;
  prefix?: string;
  suffix?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`tabular-nums ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-10' : ''}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
            {suffix}
          </span>
        )}
      </div>
    </Field>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState('general');

  // General
  const [platformName, setPlatformName] = useState('Technoestro Sportsbook');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('America/New_York');
  const [supportEmail, setSupportEmail] = useState('support@technoestro.com');

  // Betting limits
  const [minStake, setMinStake] = useState('1');
  const [maxStake, setMaxStake] = useState('5000');
  const [maxPayout, setMaxPayout] = useState('250000');
  const [margin, setMargin] = useState('6.5');

  // Feature flags
  const [flags, setFlags] = useState<Record<FlagKey, boolean>>({
    liveBetting: true,
    cashOut: true,
    sgp: true,
    casino: false,
    maintenance: false,
  });

  // Admin team
  const [admins, setAdmins] = useState<AdminUser[]>(() => db().admins.slice(0, 12));
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AdminUser['role']>('Support');

  // API keys
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [keys, setKeys] = useState([
    { id: 'pk', label: 'Publishable key', prefix: 'pk_live_', tail: '9f21', full: 'pk_live_51NkQxR2eZvKYlo2Cm9f21' },
    { id: 'sk', label: 'Secret key', prefix: 'sk_live_', tail: '4242', full: 'sk_live_51NkQxR2eZvKYlo2Cm4242' },
    { id: 'whsec', label: 'Webhook signing secret', prefix: 'whsec_', tail: 'a7d3', full: 'whsec_8Hn2QpLmZx0Vt9Ckua7d3' },
  ]);

  const scrollTo = (value: string) => {
    setActive(value);
    document.getElementById(value)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleFlag = (key: FlagKey) => {
    setFlags((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const flag = FEATURE_FLAGS.find((f) => f.key === key);
      toast.info(`${flag?.label} ${next[key] ? 'enabled' : 'disabled'}`);
      return next;
    });
  };

  const addAdmin = () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error('Name and email are required');
      return;
    }
    const admin: AdminUser = {
      id: `adm_${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      lastLogin: new Date().toISOString(),
      status: 'active',
    };
    setAdmins((prev) => [admin, ...prev]);
    toast.success('Admin invited', `${admin.name} was added as ${admin.role}`);
    setModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewRole('Support');
  };

  const copyKey = async (full: string) => {
    try {
      await navigator.clipboard.writeText(full);
    } catch {
      /* clipboard may be unavailable in some contexts */
    }
    toast.success('Copied', 'Key copied to clipboard');
  };

  const regenerate = (id: string) => {
    const rand = Math.random().toString(36).slice(2, 6);
    setKeys((prev) =>
      prev.map((k) =>
        k.id === id ? { ...k, tail: rand, full: `${k.prefix}${Math.random().toString(36).slice(2, 24)}${rand}` } : k
      )
    );
    setRevealed((prev) => ({ ...prev, [id]: false }));
    toast.warning('Key regenerated', 'Previous key is now invalid');
  };

  const adminColumns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (a) => (
        <div className="flex items-center gap-3">
          <Avatar name={a.name} className="h-8 w-8 text-xs" />
          <span className="font-medium text-foreground">{a.name}</span>
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: (a) => <span className="text-secondary">{a.email}</span> },
    { key: 'role', header: 'Role', render: (a) => <Badge variant={roleVariant(a.role)}>{a.role}</Badge> },
    {
      key: 'lastLogin',
      header: 'Last login',
      render: (a) => <span className="text-secondary tabular-nums">{formatDateTime(a.lastLogin)}</span>,
    },
    { key: 'status', header: 'Status', render: (a) => <StatusPill status={a.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (a) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => toast.info('Edit admin', `Editing ${a.name}`)}
            aria-label="Edit admin"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setAdmins((prev) => prev.filter((x) => x.id !== a.id));
              toast.warning('Admin removed', `${a.name} no longer has access`);
            }}
            aria-label="Remove admin"
          >
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPage title="Settings">
      <div className="space-y-6">
        <Tabs tabs={SECTIONS} value={active} onChange={scrollTo} className="sticky top-0 z-10" />

        <div className="mx-auto max-w-4xl space-y-6">
          {/* General */}
          <SectionCard
            id="general"
            index={0}
            icon={<Settings2 className="h-5 w-5" />}
            title="General"
            description="Core platform identity and localization."
            onSave={() => toast.success('Settings saved')}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Platform name">
                <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
              </Field>
              <Field label="Support email">
                <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
              </Field>
              <Field label="Currency">
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="CAD">CAD — Canadian Dollar</option>
                </Select>
              </Field>
              <Field label="Timezone">
                <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  <option value="America/New_York">America/New_York (ET)</option>
                  <option value="America/Chicago">America/Chicago (CT)</option>
                  <option value="America/Denver">America/Denver (MT)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </Select>
              </Field>
            </div>
          </SectionCard>

          {/* Betting limits */}
          <SectionCard
            id="limits"
            index={1}
            icon={<SlidersHorizontal className="h-5 w-5" />}
            title="Betting limits"
            description="Global stake, payout and pricing controls."
            onSave={() => toast.success('Settings saved')}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField label="Minimum stake" prefix="$" value={minStake} onChange={setMinStake} />
              <NumberField label="Maximum stake" prefix="$" value={maxStake} onChange={setMaxStake} />
              <NumberField label="Maximum payout" prefix="$" value={maxPayout} onChange={setMaxPayout} />
              <NumberField label="Default margin" suffix="%" value={margin} onChange={setMargin} />
            </div>
          </SectionCard>

          {/* Feature flags */}
          <SectionCard
            id="flags"
            index={2}
            icon={<ToggleRight className="h-5 w-5" />}
            title="Feature flags"
            description="Enable or disable platform capabilities in real time."
            onSave={() => toast.success('Settings saved')}
          >
            <div className="divide-y divide-border">
              {FEATURE_FLAGS.map((flag) => (
                <div key={flag.key} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{flag.label}</p>
                    <p className="text-xs text-secondary">{flag.description}</p>
                  </div>
                  <Switch checked={flags[flag.key]} onChange={() => toggleFlag(flag.key)} />
                </div>
              ))}
            </div>
            <AnimatePresence>
              {flags.maintenance && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="flex items-start gap-3 rounded-md border border-warning/40 bg-warning/10 p-3.5">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
                    <p className="text-xs text-warning">
                      Maintenance mode is ON. The public site and all betting are disabled for end users until you turn
                      this off.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>

          {/* Admin team */}
          <SectionCard
            id="team"
            index={3}
            icon={<Users className="h-5 w-5" />}
            title="Admin team"
            description="People with access to this admin panel and their roles."
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs text-muted tabular-nums">{admins.length} members</span>
              <Button size="sm" variant="secondary" onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Add admin
              </Button>
            </div>
            <div className="overflow-x-auto">
              <DataTable columns={adminColumns} rows={admins} />
            </div>
          </SectionCard>

          {/* API keys */}
          <SectionCard
            id="keys"
            index={4}
            icon={<KeyRound className="h-5 w-5" />}
            title="API / webhook keys"
            description="Credentials for server integrations. Treat secret keys like passwords."
          >
            <div className="space-y-3">
              {keys.map((k) => {
                const shown = revealed[k.id];
                const display = shown ? k.full : `${k.prefix}••••••••${k.tail}`;
                return (
                  <div
                    key={k.id}
                    className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{k.label}</p>
                      <code className="block truncate font-mono text-xs text-secondary tabular-nums">{display}</code>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setRevealed((prev) => ({ ...prev, [k.id]: !prev[k.id] }))}
                        aria-label={shown ? 'Hide key' : 'Reveal key'}
                      >
                        {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => copyKey(k.full)} aria-label="Copy key">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => regenerate(k.id)}>
                        <RefreshCw className="h-3.5 w-3.5" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Add admin modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setModalOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 12 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                className="w-full max-w-md rounded-lg border border-border bg-surface p-6"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={newName || 'New Admin'} className="h-9 w-9 text-xs" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Add admin</h3>
                      <p className="text-xs text-secondary">Invite a teammate to the admin panel.</p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => setModalOpen(false)} aria-label="Close">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <Field label="Full name">
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Jordan Rivera" />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="jordan@technoestro.com"
                    />
                  </Field>
                  <Field label="Role">
                    <Select value={newRole} onChange={(e) => setNewRole(e.target.value as AdminUser['role'])}>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addAdmin}>
                    <Plus className="h-4 w-4" />
                    Add admin
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </AdminPage>
  );
}
