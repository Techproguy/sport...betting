'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, ShieldCheck, Lock, Copy, Laptop, Smartphone, Monitor, LogOut } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch, Progress, Divider } from '@/components/ui/misc';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { toast } from '@/store/toast';
import { cn, formatDateTime } from '@/lib/utils';

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const BACKUP_CODES = [
  'A1B2-C3D4',
  'E5F6-G7H8',
  'J9K0-L1M2',
  'N3P4-Q5R6',
  'S7T8-U9V0',
  'W1X2-Y3Z4',
  'B5C6-D7E8',
  'F9G0-H1J2',
];

type Device = { icon: typeof Laptop; device: string; browser: string; location: string; lastActive: string; current: boolean };
const SESSIONS: Device[] = [
  { icon: Laptop, device: 'MacBook Pro', browser: 'Chrome', location: 'Newark, NJ', lastActive: 'Active now', current: true },
  { icon: Smartphone, device: 'iPhone 15 Pro', browser: 'Safari', location: 'Jersey City, NJ', lastActive: '2h ago', current: false },
  { icon: Monitor, device: 'Windows 11', browser: 'Edge', location: 'New York, NY', lastActive: '3d ago', current: false },
];

type LoginRow = { id: string; date: string; device: string; location: string; ip: string; result: 'success' | 'failed' };
const LOGIN_HISTORY: LoginRow[] = [
  { id: 'lg_1', date: '2026-07-04T09:12:00Z', device: 'MacBook Pro · Chrome', location: 'Newark, NJ', ip: '73.118.44.10', result: 'success' },
  { id: 'lg_2', date: '2026-07-03T21:44:00Z', device: 'iPhone 15 Pro · Safari', location: 'Jersey City, NJ', ip: '73.118.44.11', result: 'success' },
  { id: 'lg_3', date: '2026-07-02T18:03:00Z', device: 'Windows 11 · Edge', location: 'New York, NY', ip: '198.51.100.24', result: 'success' },
  { id: 'lg_4', date: '2026-07-01T02:27:00Z', device: 'Unknown · Firefox', location: 'Miami, FL', ip: '203.0.113.66', result: 'failed' },
  { id: 'lg_5', date: '2026-06-29T14:51:00Z', device: 'MacBook Pro · Chrome', location: 'Newark, NJ', ip: '73.118.44.10', result: 'success' },
];

function strengthLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Strong', color: '#00D66F' };
  if (score >= 60) return { label: 'Good', color: '#3B82F6' };
  if (score >= 35) return { label: 'Fair', color: '#FFC107' };
  return { label: 'Weak', color: '#FF4D4F' };
}

export default function SecurityPage() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [twoFA, setTwoFA] = useState(false);

  const strength = useMemo(() => {
    let s = 0;
    if (next.length >= 8) s += 30;
    else if (next.length >= 5) s += 15;
    if (/[0-9]/.test(next)) s += 20;
    if (/[^A-Za-z0-9]/.test(next)) s += 25;
    if (/[A-Z]/.test(next)) s += 15;
    if (/[a-z]/.test(next)) s += 10;
    return Math.min(100, s);
  }, [next]);

  const meter = strengthLabel(strength);
  const canUpdate = current.length > 0 && next.length >= 8 && next === confirm;

  const columns: Column<LoginRow>[] = [
    { key: 'date', header: 'Date', render: (r) => <span className="tabular-nums text-secondary">{formatDateTime(r.date)}</span> },
    { key: 'device', header: 'Device', render: (r) => <span className="font-medium">{r.device}</span> },
    { key: 'location', header: 'Location', render: (r) => <span className="text-secondary">{r.location}</span> },
    { key: 'ip', header: 'IP', render: (r) => <span className="tabular-nums text-secondary">{r.ip}</span> },
    {
      key: 'result',
      header: 'Result',
      align: 'right',
      render: (r) => <Badge variant={r.result === 'success' ? 'success' : 'danger'}>{r.result}</Badge>,
    },
  ];

  const updatePassword = () => {
    if (!canUpdate) {
      toast.error('Check your entries', 'Passwords must match and be at least 8 characters.');
      return;
    }
    toast.success('Password updated', 'Your password has been changed successfully.');
    setCurrent('');
    setNext('');
    setConfirm('');
  };

  return (
    <div className="space-y-6">
      <motion.div {...fade(0)} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security</h1>
          <p className="mt-1 text-sm text-secondary">Protect your account with a strong password, 2FA, and session controls.</p>
        </div>
      </motion.div>

      <div className="grid gap-6">
        {/* Change password */}
        <motion.div {...fade(0.05)}>
          <Card className="lg:max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" /> Change password
              </CardTitle>
              <CardDescription>Use at least 8 characters with a number, symbol, and uppercase letter.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" placeholder="••••••••" value={current} onChange={(e) => setCurrent(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" placeholder="••••••••" value={next} onChange={(e) => setNext(e.target.value)} />
                {next.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <Progress value={strength} accent={meter.color} />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">Password strength</span>
                      <span className="font-medium" style={{ color: meter.color }}>{meter.label}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                {confirm.length > 0 && next !== confirm && (
                  <p className="text-xs text-danger">Passwords do not match.</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={updatePassword} disabled={!canUpdate}>Update password</Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Two-factor auth */}
        <motion.div {...fade(0.1)}>
          <Card className="lg:max-w-2xl">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Two-factor authentication
                  </CardTitle>
                  <CardDescription>Add an extra layer of security with an authenticator app.</CardDescription>
                </div>
                <Switch checked={twoFA} onChange={setTwoFA} />
              </div>
            </CardHeader>
            {twoFA && (
              <CardContent className="space-y-5">
                <Divider label="Scan to set up" />
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative mx-auto h-40 w-40 shrink-0 rounded-lg border border-border bg-elevated p-3 sm:mx-0">
                    <div className="grid h-full w-full grid-cols-8 grid-rows-8 gap-0.5">
                      {Array.from({ length: 64 }).map((_, i) => {
                        const row = Math.floor(i / 8);
                        const col = i % 8;
                        const on = (row * 7 + col * 3 + (row ^ col)) % 3 !== 0;
                        return <div key={i} className={cn('rounded-[1px]', on ? 'bg-foreground' : 'bg-transparent')} />;
                      })}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background/90 text-primary ring-1 ring-border">
                        <Lock className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm font-medium">Backup codes</p>
                      <p className="text-xs text-secondary">Store these somewhere safe. Each code can be used once.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {BACKUP_CODES.map((c) => (
                        <code key={c} className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-center text-sm tabular-nums tracking-wider text-foreground">
                          {c}
                        </code>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.info('Codes copied', 'Backup codes copied to clipboard.')}>
                      <Copy className="h-4 w-4" /> Copy codes
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Active sessions */}
        <motion.div {...fade(0.15)}>
          <Card>
            <CardHeader>
              <CardTitle>Active sessions</CardTitle>
              <CardDescription>Devices currently signed in to your account.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {SESSIONS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.device}
                    {...fade(0.2 + i * 0.05)}
                    className="flex items-center justify-between gap-4 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-elevated text-secondary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="flex items-center gap-2 text-sm font-medium">
                          {s.device}
                          {s.current && <Badge variant="success">current</Badge>}
                        </p>
                        <p className="text-xs text-secondary">
                          {s.browser} · {s.location} · {s.lastActive}
                        </p>
                      </div>
                    </div>
                    {!s.current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success('Session revoked', `${s.device} has been signed out.`)}
                      >
                        Revoke
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Login history */}
        <motion.div {...fade(0.25)}>
          <Card>
            <CardHeader>
              <CardTitle>Login history</CardTitle>
              <CardDescription>Recent sign-in attempts on your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} rows={LOGIN_HISTORY} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger zone */}
        <motion.div {...fade(0.3)}>
          <Card className="border-danger/30">
            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                  <LogOut className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Log out all devices</p>
                  <p className="text-sm text-secondary">End every active session, including this one.</p>
                </div>
              </div>
              <Button variant="danger" onClick={() => toast.warning('Signed out everywhere', 'All active sessions have been ended.')}>
                Log out all devices
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
