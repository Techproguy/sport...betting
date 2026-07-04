'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Lock,
  ShieldCheck,
  UploadCloud,
  FileText,
  Camera,
  ScanFace,
  ArrowLeft,
  ArrowRight,
  User,
  MapPin,
  CreditCard,
  Pencil,
  Loader2,
  Clock,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/misc';
import { US_STATES } from '@/lib/mock/catalog';
import { cn } from '@/lib/utils';
import { toast } from '@/store/toast';

const NATIONALITIES = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Mexico', 'Brazil', 'Japan', 'Other'];
const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Other'];

const STEP_META = [
  { label: 'Personal', icon: User },
  { label: 'Address', icon: MapPin },
  { label: 'SSN', icon: CreditCard },
  { label: 'Government ID', icon: FileText },
  { label: 'Proof of Address', icon: FileText },
  { label: 'Face Scan', icon: ScanFace },
  { label: 'Review', icon: Check },
  { label: 'Done', icon: PartyPopper },
];

interface FormState {
  firstName: string;
  lastName: string;
  dob: string;
  nationality: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  ssn: string;
}

const EMPTY: FormState = {
  firstName: '',
  lastName: '',
  dob: '',
  nationality: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States',
  ssn: '',
};

function isAdult(dob: string): boolean {
  if (!dob) return false;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const age = now.getFullYear() - d.getFullYear() - (now < new Date(now.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
  return age >= 21;
}

/* ---------- Step progress indicator ---------- */

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center">
        {STEP_META.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <React.Fragment key={s.label}>
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: done ? '#00D66F' : active ? 'rgba(0,214,111,0.12)' : '#1C1C1C',
                    borderColor: done || active ? '#00D66F' : '#2A2A2A',
                    scale: active ? 1.08 : 1,
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold"
                >
                  {done ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </motion.span>
                  ) : (
                    <span className={active ? 'text-primary' : 'text-muted'}>{i + 1}</span>
                  )}
                </motion.div>
                <span className={cn('mt-1.5 hidden text-[10px] font-medium sm:block', active ? 'text-foreground' : done ? 'text-primary' : 'text-muted')}>
                  {s.label}
                </span>
              </div>
              {i < STEP_META.length - 1 && (
                <div className="mx-1 h-0.5 flex-1 overflow-hidden rounded-full bg-elevated sm:mx-1.5">
                  <motion.div
                    initial={false}
                    animate={{ width: done ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-primary"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Reusable step shell ---------- */

function StepShell({ icon: Icon, title, description, children }: { icon: React.ElementType; title: string; description: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-sm text-secondary">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ---------- Upload dropzone ---------- */

function Upload({ label, hint, done, onComplete }: { label: string; hint: string; done: string; onComplete: (name: string) => void }) {
  const [status, setStatus] = React.useState<'idle' | 'uploading' | 'verified'>(done ? 'verified' : 'idle');
  const [progress, setProgress] = React.useState(done ? 100 : 0);
  const [dragging, setDragging] = React.useState(false);
  const [fileName, setFileName] = React.useState(done);
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function simulate(name: string) {
    setFileName(name);
    setStatus('uploading');
    setProgress(0);
    let p = 0;
    timer.current = setInterval(() => {
      p += Math.floor(8 + Math.random() * 16);
      if (p >= 100) {
        p = 100;
        if (timer.current) clearInterval(timer.current);
        setProgress(100);
        setStatus('verified');
        onComplete(name);
      } else {
        setProgress(p);
      }
    }, 180);
  }

  function pick() {
    if (status === 'uploading') return;
    const names = ['drivers-license.jpg', 'passport-scan.png', 'id-document.jpg'];
    simulate(names[Math.floor(Math.random() * names.length)]);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (status === 'uploading') return;
    const f = e.dataTransfer.files?.[0];
    simulate(f ? f.name : 'uploaded-document.jpg');
  }

  if (status === 'verified') {
    return (
      <div className="rounded-lg border border-success/40 bg-success/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15 text-success">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{fileName}</p>
            <p className="text-xs text-secondary">{label}</p>
          </div>
          <Badge variant="success">
            <Check className="h-3 w-3" /> Verified
          </Badge>
        </div>
        <button onClick={() => { setStatus('idle'); setProgress(0); }} className="mt-2 text-xs text-muted hover:text-foreground">
          Replace file
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={pick}
      className={cn(
        'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
        dragging ? 'border-primary bg-primary/5' : 'border-border bg-surface/50 hover:border-primary/50'
      )}
    >
      {status === 'uploading' ? (
        <div className="space-y-3">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">Uploading {fileName}…</p>
          <Progress value={progress} />
          <p className="text-xs text-muted">{progress}% · scanning document</p>
        </div>
      ) : (
        <>
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-elevated text-primary">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-1 text-xs text-secondary">{hint}</p>
          <p className="mt-2 text-xs text-muted">Drag &amp; drop or click to upload · JPG, PNG, PDF up to 10MB</p>
        </>
      )}
    </div>
  );
}

/* ---------- Face scan ---------- */

function FaceScan({ verified, onVerified }: { verified: boolean; onVerified: () => void }) {
  const [scanning, setScanning] = React.useState(false);

  function start() {
    if (scanning || verified) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onVerified();
      toast.success('Face verified', 'Liveness check passed.');
    }, 2500);
  }

  return (
    <div className="flex flex-col items-center">
      <div className={cn('relative flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border-2', verified ? 'border-success' : scanning ? 'border-primary' : 'border-border')}>
        <div className="absolute inset-0 bg-gradient-to-b from-elevated to-surface" />
        {/* corner frame */}
        {!verified && (
          <div className="pointer-events-none absolute inset-6 rounded-full border border-dashed border-primary/40" />
        )}
        {verified ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success">
            <ShieldCheck className="h-10 w-10" />
          </motion.div>
        ) : (
          <ScanFace className={cn('relative z-10 h-24 w-24', scanning ? 'text-primary' : 'text-muted')} />
        )}
        {scanning && (
          <motion.div
            initial={{ top: '8%' }}
            animate={{ top: ['8%', '88%', '8%'] }}
            transition={{ duration: 1.25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-0 right-0 z-20 h-0.5 bg-primary shadow-[0_0_12px_2px_rgba(0,214,111,0.7)]"
          />
        )}
      </div>

      <p className="mt-5 text-sm text-secondary">
        {verified ? 'Liveness confirmed — you look great.' : scanning ? 'Hold still — scanning your face…' : 'Center your face in the frame and start the scan.'}
      </p>

      {verified ? (
        <Badge variant="success" className="mt-4">
          <Check className="h-3 w-3" /> Face verification complete
        </Badge>
      ) : (
        <Button className="mt-5" loading={scanning} onClick={start}>
          {!scanning && (
            <>
              <Camera className="h-4 w-4" /> Start face scan
            </>
          )}
        </Button>
      )}
    </div>
  );
}

/* ---------- Wizard ---------- */

export function KycWizard() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [dir, setDir] = React.useState(1);
  const [touched, setTouched] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [docs, setDocs] = React.useState({ idFront: '', idBack: '', proof: '' });
  const [faceVerified, setFaceVerified] = React.useState(false);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: k === 'ssn' ? e.target.value.replace(/\D/g, '').slice(0, 4) : e.target.value }));

  const stepValid = (s: number): boolean => {
    switch (s) {
      case 0:
        return form.firstName.trim().length >= 2 && form.lastName.trim().length >= 2 && isAdult(form.dob) && !!form.nationality;
      case 1:
        return form.street.trim().length >= 3 && form.city.trim().length >= 2 && !!form.state && /^\d{5}$/.test(form.zip) && !!form.country;
      case 2:
        return /^\d{4}$/.test(form.ssn);
      case 3:
        return !!docs.idFront && !!docs.idBack;
      case 4:
        return !!docs.proof;
      case 5:
        return faceVerified;
      default:
        return true;
    }
  };

  const valid = stepValid(step);

  function next() {
    setTouched(true);
    if (!valid) return;
    setTouched(false);
    setDir(1);
    setStep((s) => Math.min(s + 1, 7));
  }

  function back() {
    setTouched(false);
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  function goto(s: number) {
    setTouched(false);
    setDir(s < step ? -1 : 1);
    setStep(s);
  }

  async function submit() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    toast.success('Verification submitted', 'Our team is reviewing your documents.');
    setDir(1);
    setStep(7);
  }

  const errCls = (bad: boolean) => (touched && bad ? 'border-danger focus-visible:border-danger focus-visible:ring-danger/20' : '');
  const errMsg = (bad: boolean, msg: string) => (touched && bad ? <p className="mt-1.5 text-xs font-medium text-danger">{msg}</p> : null);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 shadow-card sm:p-8">
      {step < 7 && <StepIndicator step={step} />}

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          initial={{ opacity: 0, x: dir * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -40 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {step === 0 && (
            <StepShell icon={User} title="Personal information" description="Enter your legal name exactly as it appears on your government ID.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" value={form.firstName} onChange={set('firstName')} placeholder="Alex" className={cn('mt-1.5', errCls(form.firstName.trim().length < 2))} />
                  {errMsg(form.firstName.trim().length < 2, 'Enter your first name')}
                </div>
                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" value={form.lastName} onChange={set('lastName')} placeholder="Morgan" className={cn('mt-1.5', errCls(form.lastName.trim().length < 2))} />
                  {errMsg(form.lastName.trim().length < 2, 'Enter your last name')}
                </div>
                <div>
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input id="dob" type="date" value={form.dob} onChange={set('dob')} className={cn('mt-1.5', errCls(!isAdult(form.dob)))} />
                  {touched && !isAdult(form.dob) ? errMsg(true, 'You must be at least 21 years old') : <p className="mt-1.5 text-xs text-muted">Must be 21+</p>}
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select id="nationality" value={form.nationality} onChange={set('nationality')} className={cn('mt-1.5', errCls(!form.nationality))}>
                    <option value="">Select nationality</option>
                    {NATIONALITIES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </Select>
                  {errMsg(!form.nationality, 'Select your nationality')}
                </div>
              </div>
            </StepShell>
          )}

          {step === 1 && (
            <StepShell icon={MapPin} title="Residential address" description="We use this to confirm you're in a state where betting is legal.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="street">Street address</Label>
                  <Input id="street" value={form.street} onChange={set('street')} placeholder="123 Market Street, Apt 4B" className={cn('mt-1.5', errCls(form.street.trim().length < 3))} />
                  {errMsg(form.street.trim().length < 3, 'Enter your street address')}
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={form.city} onChange={set('city')} placeholder="Jersey City" className={cn('mt-1.5', errCls(form.city.trim().length < 2))} />
                  {errMsg(form.city.trim().length < 2, 'Enter your city')}
                </div>
                <div>
                  <Label htmlFor="addrState">State</Label>
                  <Select id="addrState" value={form.state} onChange={set('state')} className={cn('mt-1.5', errCls(!form.state))}>
                    <option value="">Select state</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                  {errMsg(!form.state, 'Select your state')}
                </div>
                <div>
                  <Label htmlFor="zip">ZIP code</Label>
                  <Input id="zip" inputMode="numeric" value={form.zip} onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))} placeholder="07302" className={cn('mt-1.5', errCls(!/^\d{5}$/.test(form.zip)))} />
                  {errMsg(!/^\d{5}$/.test(form.zip), 'Enter a valid 5-digit ZIP')}
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select id="country" value={form.country} onChange={set('country')} className={cn('mt-1.5', errCls(!form.country))}>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell icon={CreditCard} title="Social Security Number" description="Enter the last 4 digits of your SSN to verify your identity.">
              <div className="mx-auto max-w-xs">
                <Label htmlFor="ssn">Last 4 of SSN</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="ssn"
                    inputMode="numeric"
                    value={form.ssn ? '•'.repeat(form.ssn.length) : ''}
                    onChange={set('ssn')}
                    placeholder="••••"
                    className={cn('text-center text-2xl tracking-[0.6em]', errCls(!/^\d{4}$/.test(form.ssn)))}
                  />
                </div>
                {errMsg(!/^\d{4}$/.test(form.ssn), 'Enter the last 4 digits of your SSN')}
              </div>
              <div className="mx-auto mt-5 flex max-w-md items-start gap-3 rounded-lg border border-border bg-surface/60 p-4">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-secondary">
                  Your SSN is encrypted with bank-grade AES-256 and never shared with third parties. We use it solely to confirm your identity with regulatory databases.
                </p>
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell icon={FileText} title="Government-issued ID" description="Upload clear photos of the front and back of your ID or passport.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Upload label="Front of ID" hint="Driver's license, state ID, or passport" done={docs.idFront} onComplete={(n) => setDocs((d) => ({ ...d, idFront: n }))} />
                <Upload label="Back of ID" hint="Must show the full document edge-to-edge" done={docs.idBack} onComplete={(n) => setDocs((d) => ({ ...d, idBack: n }))} />
              </div>
              {touched && !(docs.idFront && docs.idBack) && <p className="mt-3 text-xs font-medium text-danger">Upload both the front and back of your ID.</p>}
            </StepShell>
          )}

          {step === 4 && (
            <StepShell icon={FileText} title="Proof of address" description="Upload a utility bill or bank statement from the last 90 days.">
              <Upload label="Proof of address document" hint="Utility bill, bank statement, or lease agreement" done={docs.proof} onComplete={(n) => setDocs((d) => ({ ...d, proof: n }))} />
              {touched && !docs.proof && <p className="mt-3 text-xs font-medium text-danger">Upload a proof-of-address document to continue.</p>}
            </StepShell>
          )}

          {step === 5 && (
            <StepShell icon={ScanFace} title="Face verification" description="A quick liveness check to match you against your ID photo.">
              <FaceScan verified={faceVerified} onVerified={() => setFaceVerified(true)} />
              {touched && !faceVerified && <p className="mt-4 text-center text-xs font-medium text-danger">Complete the face scan to continue.</p>}
            </StepShell>
          )}

          {step === 6 && (
            <StepShell icon={Check} title="Review your details" description="Make sure everything is correct before submitting for review.">
              <div className="space-y-3">
                <ReviewCard title="Personal information" onEdit={() => goto(0)}>
                  <Row label="Name" value={`${form.firstName} ${form.lastName}`} />
                  <Row label="Date of birth" value={form.dob || '—'} />
                  <Row label="Nationality" value={form.nationality || '—'} />
                </ReviewCard>
                <ReviewCard title="Address" onEdit={() => goto(1)}>
                  <Row label="Street" value={form.street || '—'} />
                  <Row label="City / State" value={`${form.city || '—'}, ${form.state || '—'}`} />
                  <Row label="ZIP / Country" value={`${form.zip || '—'} · ${form.country}`} />
                </ReviewCard>
                <ReviewCard title="Identity & documents" onEdit={() => goto(2)}>
                  <Row label="SSN (last 4)" value={form.ssn ? `••• ${form.ssn}` : '—'} />
                  <Row label="Government ID" value={<DocOk ok={!!(docs.idFront && docs.idBack)} label="Front & back" />} />
                  <Row label="Proof of address" value={<DocOk ok={!!docs.proof} label="Uploaded" />} />
                  <Row label="Face verification" value={<DocOk ok={faceVerified} label="Passed" />} />
                </ReviewCard>
              </div>
            </StepShell>
          )}

          {step === 7 && (
            <div className="flex flex-col items-center py-6 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }} className="relative flex h-24 w-24 items-center justify-center rounded-full bg-success/12 text-success">
                <span className="absolute inset-0 animate-ping rounded-full bg-success/10" />
                <motion.svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <motion.path d="M4 12.5l5 5 11-11" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.5 }} />
                </motion.svg>
              </motion.div>
              <h2 className="mt-6 text-2xl font-bold tracking-tight">Verification submitted</h2>
              <p className="mt-2 max-w-md text-sm text-secondary">
                Thanks, {form.firstName || 'there'}. Your documents are in our review queue. Most verifications are approved automatically.
              </p>

              <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-surface/60 px-5 py-3.5">
                <Clock className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">Estimated review time</p>
                  <p className="text-xs text-secondary">Usually under 5 minutes · up to 24 hours</p>
                </div>
                <Badge variant="warning" className="ml-2">Pending</Badge>
              </div>

              <Button size="lg" className="mt-7" onClick={() => router.push('/dashboard')}>
                Go to dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {step < 7 && (
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
          <Button variant="ghost" onClick={back} disabled={step === 0} className={step === 0 ? 'invisible' : ''}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step === 6 ? (
            <Button size="lg" loading={submitting} onClick={submit}>
              {!submitting && (
                <>
                  <ShieldCheck className="h-4 w-4" /> Submit for verification
                </>
              )}
            </Button>
          ) : (
            <Button size="lg" onClick={next} disabled={touched && !valid}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Review helpers ---------- */

function ReviewCard({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <button onClick={onEdit} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:brightness-110">
          <Pencil className="h-3 w-3" /> Edit
        </button>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-secondary">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function DocOk({ ok, label }: { ok: boolean; label: string }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 text-success">
      <Check className="h-3.5 w-3.5" /> {label}
    </span>
  ) : (
    <span className="text-muted">Missing</span>
  );
}
