'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Bell, Percent, Globe, Megaphone, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label, Select } from '@/components/ui/input';
import { Switch, Divider } from '@/components/ui/misc';
import { Button } from '@/components/ui/button';
import { toast } from '@/store/toast';
import { cn } from '@/lib/utils';

type Channel = 'email' | 'sms' | 'push';
type Category = 'Bet updates' | 'Promotions' | 'Wallet' | 'Security';

const CATEGORIES: Category[] = ['Bet updates', 'Promotions', 'Wallet', 'Security'];
const CHANNELS: { key: Channel; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
  { key: 'push', label: 'Push' },
];

type NotifState = Record<Category, Record<Channel, boolean>>;

const initialNotif: NotifState = {
  'Bet updates': { email: true, sms: true, push: true },
  Promotions: { email: true, sms: false, push: false },
  Wallet: { email: true, sms: false, push: true },
  Security: { email: true, sms: true, push: true },
};

const ODDS_FORMATS = ['American', 'Decimal', 'Fractional'] as const;
type OddsFormat = (typeof ODDS_FORMATS)[number];

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export default function SettingsPage() {
  const [notif, setNotif] = useState<NotifState>(initialNotif);
  const [oddsFormat, setOddsFormat] = useState<OddsFormat>('American');
  const [timezone, setTimezone] = useState('America/New_York');
  const [language, setLanguage] = useState('en-US');
  const [emailOffers, setEmailOffers] = useState(true);
  const [partnerOffers, setPartnerOffers] = useState(false);

  const toggleNotif = (cat: Category, ch: Channel) =>
    setNotif((prev) => ({ ...prev, [cat]: { ...prev[cat], [ch]: !prev[cat][ch] } }));

  return (
    <div className="space-y-6">
      <motion.div {...fade(0)} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-secondary">Manage notifications, display preferences, and marketing options.</p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:max-w-4xl">
        {/* Notification preferences */}
        <motion.div {...fade(0.05)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" /> Notification preferences
              </CardTitle>
              <CardDescription>Choose how you want to be notified for each category.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="hidden grid-cols-[1fr_repeat(3,72px)] items-center gap-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted sm:grid">
                <span>Category</span>
                {CHANNELS.map((c) => (
                  <span key={c.key} className="text-center">{c.label}</span>
                ))}
              </div>
              <div className="divide-y divide-border">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat}
                    className="grid grid-cols-3 items-center gap-3 py-3 sm:grid-cols-[1fr_repeat(3,72px)]"
                  >
                    <span className="col-span-3 text-sm font-medium sm:col-span-1">{cat}</span>
                    {CHANNELS.map((c) => (
                      <div key={c.key} className="flex flex-col items-center gap-1">
                        <span className="text-[11px] uppercase text-muted sm:hidden">{c.label}</span>
                        <Switch checked={notif[cat][c.key]} onChange={() => toggleNotif(cat, c.key)} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button size="sm" onClick={() => toast.success('Settings saved', 'Notification preferences updated.')}>
                <Save className="h-4 w-4" /> Save changes
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Display preferences */}
        <motion.div {...fade(0.1)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" /> Display preferences
              </CardTitle>
              <CardDescription>Odds format, timezone, and language.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Odds format</Label>
                <div className="flex flex-wrap gap-2">
                  {ODDS_FORMATS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setOddsFormat(f)}
                      className={cn(
                        'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                        oddsFormat === f
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                          : 'border-border bg-elevated text-secondary hover:text-foreground'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted">
                  {oddsFormat === 'American' && 'Shown as +150 / -110.'}
                  {oddsFormat === 'Decimal' && 'Shown as 2.50 / 1.91.'}
                  {oddsFormat === 'Fractional' && 'Shown as 3/2 / 10/11.'}
                </p>
              </div>

              <Divider />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tz" className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Timezone
                  </Label>
                  <Select id="tz" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                    <option value="America/New_York">Eastern (ET) — New York</option>
                    <option value="America/Chicago">Central (CT) — Chicago</option>
                    <option value="America/Denver">Mountain (MT) — Denver</option>
                    <option value="America/Los_Angeles">Pacific (PT) — Los Angeles</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lang">Language</Label>
                  <Select id="lang" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="en-US">English (US)</option>
                    <option value="es-US">Español (US)</option>
                    <option value="fr-CA">Français (CA)</option>
                    <option value="pt-BR">Português (BR)</option>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button size="sm" onClick={() => toast.success('Settings saved', 'Display preferences updated.')}>
                <Save className="h-4 w-4" /> Save changes
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Theme note */}
        <motion.div {...fade(0.15)}>
          <Card className="border-info/30 bg-info/5">
            <CardContent className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-elevated text-info">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Dark mode is the default</p>
                <p className="text-sm text-secondary">
                  Technoestro is designed dark-first for low-light, long-session comfort. A light theme is coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Marketing preferences */}
        <motion.div {...fade(0.2)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" /> Marketing preferences
              </CardTitle>
              <CardDescription>Control promotional communications. You can opt out anytime.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">Email offers</p>
                  <p className="text-sm text-secondary">Boosts, free bets, and personalized promotions.</p>
                </div>
                <Switch checked={emailOffers} onChange={setEmailOffers} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">Partner offers</p>
                  <p className="text-sm text-secondary">Third-party offers from trusted partners.</p>
                </div>
                <Switch checked={partnerOffers} onChange={setPartnerOffers} />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button size="sm" onClick={() => toast.success('Settings saved', 'Marketing preferences updated.')}>
                <Save className="h-4 w-4" /> Save changes
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
