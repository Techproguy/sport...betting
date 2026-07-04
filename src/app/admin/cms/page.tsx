'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Plus,
  FileText,
  Image as ImageIcon,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  Rocket,
} from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Label } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/misc';
import { db } from '@/lib/mock/db';
import { toast } from '@/store/toast';
import { cn } from '@/lib/utils';

type Section = 'banners' | 'pages' | 'faq';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  active: boolean;
}

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  updated: string;
  published: boolean;
  body: string;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
}

// ---- deterministic seeds ---------------------------------------------------

function seedBanners(): Banner[] {
  const promos = db().promotions.slice(0, 4);
  const active = [true, true, false, true];
  return promos.map((p, i) => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    tag: p.cta || p.tag,
    active: active[i] ?? true,
  }));
}

const PAGE_BODY: Record<string, string> = {
  about:
    'Technoestro is a next-generation sportsbook built for speed, transparency, and fairness. ' +
    'Founded in 2024, our platform serves bettors across regulated markets with real-time odds, ' +
    'instant settlements, and a relentless focus on responsible play.',
  terms:
    'By accessing Technoestro you agree to these Terms of Service. You must be 21 years or older and ' +
    'physically located in a state where online sports wagering is legal. All wagers are final once ' +
    'accepted. Technoestro reserves the right to void bets placed in error or in violation of house rules.',
  privacy:
    'This Privacy Policy explains how Technoestro collects, uses, and protects your personal data. ' +
    'We collect identity and payment information solely to verify eligibility, process transactions, and ' +
    'comply with regulatory obligations. We never sell your data to third parties.',
  'responsible-gambling':
    'Technoestro is committed to responsible gambling. Set deposit, wager, and time limits from your ' +
    'account settings at any time. If gambling stops being fun, self-exclusion tools are one click away. ' +
    'Confidential help is available 24/7 at 1-800-522-4700. Please play within your means. 21+ only.',
  faq:
    'Frequently asked questions about deposits, withdrawals, bet settlement, and account verification. ' +
    'For anything not covered here, our support team is available 24/7 via live chat.',
};

function seedPages(): StaticPage[] {
  const defs: { title: string; slug: string; updated: string; published: boolean }[] = [
    { title: 'About Us', slug: '/about', updated: 'Jun 28, 2026', published: true },
    { title: 'Terms of Service', slug: '/terms', updated: 'May 14, 2026', published: true },
    { title: 'Privacy Policy', slug: '/privacy', updated: 'May 14, 2026', published: true },
    { title: 'Responsible Gambling', slug: '/responsible-gambling', updated: 'Jun 02, 2026', published: true },
    { title: 'FAQ', slug: '/faq', updated: 'Apr 09, 2026', published: false },
  ];
  return defs.map((d) => {
    const key = d.slug.replace('/', '');
    return { id: key, ...d, body: PAGE_BODY[key] ?? '' };
  });
}

function seedFaqs(): Faq[] {
  return [
    {
      id: 'faq_1',
      question: 'How long do withdrawals take?',
      answer:
        'Withdrawals to debit cards and PayPal are typically processed within 24 hours. ACH bank ' +
        'transfers may take 3-5 business days depending on your bank.',
    },
    {
      id: 'faq_2',
      question: 'What is the minimum deposit?',
      answer: 'The minimum deposit is $10 across all supported payment methods, including Visa, Mastercard, ACH, and Apple Pay.',
    },
    {
      id: 'faq_3',
      question: 'How do I verify my identity (KYC)?',
      answer:
        'Upload a government-issued photo ID and a recent proof of address from Account > Verification. ' +
        'Most submissions are reviewed within a few minutes.',
    },
    {
      id: 'faq_4',
      question: 'When are winning bets paid out?',
      answer:
        'Winnings are credited to your balance automatically as soon as the underlying event is officially ' +
        'settled by the sports data provider.',
    },
    {
      id: 'faq_5',
      question: 'Can I set responsible gambling limits?',
      answer:
        'Yes. You can set daily, weekly, or monthly deposit and wager limits, cooling-off periods, and ' +
        'self-exclusion at any time from your account settings.',
    },
  ];
}

// ---------------------------------------------------------------------------

export default function CmsPage() {
  const [section, setSection] = React.useState<Section>('banners');
  const [dirty, setDirty] = React.useState(false);

  const [banners, setBanners] = React.useState<Banner[]>(seedBanners);
  const [pages, setPages] = React.useState<StaticPage[]>(seedPages);
  const [faqs, setFaqs] = React.useState<Faq[]>(seedFaqs);

  const [editingPage, setEditingPage] = React.useState<string | null>(null);
  const [draftBody, setDraftBody] = React.useState('');
  const [openFaq, setOpenFaq] = React.useState<string | null>(null);

  const markDirty = () => setDirty(true);

  // ---- banners ----
  const toggleBanner = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
    const b = banners.find((x) => x.id === id);
    toast.info(`Banner ${b && !b.active ? 'activated' : 'hidden'}`, b?.title);
    markDirty();
  };

  const moveBanner = (index: number, dir: -1 | 1) => {
    setBanners((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    toast.info('Banner reordered');
    markDirty();
  };

  // ---- pages ----
  const openEditor = (p: StaticPage) => {
    setEditingPage(p.id);
    setDraftBody(p.body);
  };

  const savePage = (id: string) => {
    const now = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, body: draftBody, updated: now } : p))
    );
    setEditingPage(null);
    toast.success('Saved', 'Page content updated');
    markDirty();
  };

  // ---- faqs ----
  const updateFaq = (id: string, patch: Partial<Faq>) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    markDirty();
  };

  const removeFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    if (openFaq === id) setOpenFaq(null);
    toast.info('FAQ removed');
    markDirty();
  };

  const addFaq = () => {
    const id = `faq_${Math.random().toString(36).slice(2, 9)}`;
    setFaqs((prev) => [...prev, { id, question: '', answer: '' }]);
    setOpenFaq(id);
    markDirty();
  };

  const publish = () => {
    toast.success('Changes published', 'Your content is now live');
    setDirty(false);
  };

  const tabs = [
    { value: 'banners', label: 'Homepage Banners', icon: <ImageIcon className="h-4 w-4" /> },
    { value: 'pages', label: 'Static Pages', icon: <FileText className="h-4 w-4" /> },
    { value: 'faq', label: 'FAQ', icon: <HelpCircle className="h-4 w-4" /> },
  ];

  return (
    <AdminPage title="Content Management">
      <div className="space-y-6 pb-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-secondary">
            Manage what your players see across the marketing site and help center.
          </p>
        </div>

        <Tabs tabs={tabs} value={section} onChange={(v) => setSection(v as Section)} />

        {/* ---------------- BANNERS ---------------- */}
        {section === 'banners' && (
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Homepage Banners</h3>
              <span className="text-xs text-muted">{banners.length} slots · order = display priority</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {banners.map((b, i) => (
                  <motion.div
                    key={b.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border border-border bg-surface p-3',
                      !b.active && 'opacity-60'
                    )}
                  >
                    <GripVertical className="h-4 w-4 flex-shrink-0 cursor-grab text-muted" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{b.title}</span>
                        <Badge variant="primary">{b.tag}</Badge>
                      </div>
                      <span className="truncate text-xs text-secondary">{b.subtitle}</span>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <div className="hidden items-center gap-2 sm:flex">
                        <span className="text-xs text-muted">
                          {b.active ? 'Active' : 'Hidden'}
                        </span>
                        <Switch checked={b.active} onChange={() => toggleBanner(b.id)} />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Move up"
                          disabled={i === 0}
                          onClick={() => moveBanner(i, -1)}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Move down"
                          disabled={i === banners.length - 1}
                          onClick={() => moveBanner(i, 1)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="mt-3 flex sm:hidden">
              <span className="text-xs text-muted">Toggle a banner from its row to show or hide it.</span>
            </div>
          </div>
        )}

        {/* ---------------- STATIC PAGES ---------------- */}
        {section === 'pages' && (
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Static Pages</h3>
              <span className="text-xs text-muted">{pages.length} pages</span>
            </div>
            <div className="space-y-2">
              {pages.map((p) => (
                <div key={p.id} className="rounded-lg border border-border bg-surface">
                  <div className="flex flex-wrap items-center gap-3 p-3">
                    <FileText className="h-4 w-4 flex-shrink-0 text-muted" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{p.title}</span>
                      <span className="truncate font-mono text-xs text-secondary">{p.slug}</span>
                    </div>
                    <span className="hidden text-xs text-muted sm:block">
                      Updated {p.updated}
                    </span>
                    <Badge variant={p.published ? 'success' : 'warning'}>
                      {p.published ? 'Published' : 'Draft'}
                    </Badge>
                    <Button
                      variant={editingPage === p.id ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => (editingPage === p.id ? setEditingPage(null) : openEditor(p))}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      {editingPage === p.id ? 'Close' : 'Edit'}
                    </Button>
                  </div>
                  <AnimatePresence initial={false}>
                    {editingPage === p.id && (
                      <motion.div
                        key="editor"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="space-y-3 p-4">
                          <div className="flex items-center justify-between">
                            <Label>Page body</Label>
                            <span className="text-xs text-muted">{draftBody.length} chars</span>
                          </div>
                          <textarea
                            value={draftBody}
                            onChange={(e) => setDraftBody(e.target.value)}
                            rows={7}
                            className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary"
                            placeholder="Write the page content..."
                          />
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingPage(null)}>
                              Cancel
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => savePage(p.id)}>
                              Save
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- FAQ ---------------- */}
        {section === 'faq' && (
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">FAQ Manager</h3>
              <Button variant="outline" size="sm" onClick={addFaq}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add FAQ
              </Button>
            </div>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {faqs.map((f) => {
                  const open = openFaq === f.id;
                  return (
                    <motion.div
                      key={f.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden rounded-lg border border-border bg-surface"
                    >
                      <div className="flex items-center gap-2 p-3">
                        <button
                          onClick={() => setOpenFaq(open ? null : f.id)}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        >
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 flex-shrink-0 text-muted transition-transform',
                              open && 'rotate-180'
                            )}
                          />
                          <span className="truncate text-sm font-medium">
                            {f.question || <span className="text-muted">Untitled question</span>}
                          </span>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Remove FAQ"
                          onClick={() => removeFaq(f.id)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-border"
                          >
                            <div className="space-y-3 p-4">
                              <div className="space-y-1.5">
                                <Label>Question</Label>
                                <Input
                                  value={f.question}
                                  onChange={(e) => updateFaq(f.id, { question: e.target.value })}
                                  placeholder="Enter the question"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label>Answer</Label>
                                <textarea
                                  value={f.answer}
                                  onChange={(e) => updateFaq(f.id, { answer: e.target.value })}
                                  rows={4}
                                  className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary"
                                  placeholder="Enter the answer"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {faqs.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <HelpCircle className="h-8 w-8 text-muted" />
                  <p className="text-sm text-secondary">No FAQ items yet.</p>
                  <Button variant="outline" size="sm" onClick={addFaq}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add your first FAQ
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---------------- PUBLISH BAR ---------------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur lg:pl-64">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-2 text-sm">
            {dirty ? (
              <>
                <span className="h-2 w-2 flex-shrink-0 animate-pulse-live rounded-full bg-warning" />
                <span className="text-warning">You have unsaved changes</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" />
                <span className="text-secondary">All changes published</span>
              </>
            )}
          </div>
          <Button variant="primary" size="md" disabled={!dirty} onClick={publish}>
            <Rocket className="mr-1.5 h-4 w-4" />
            Publish changes
          </Button>
        </div>
      </div>
    </AdminPage>
  );
}
