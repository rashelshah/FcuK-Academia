'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailIsValid = useMemo(
    () => !email || email.trim().toLowerCase().endsWith('@srmist.edu.in'),
    [email],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@srmist.edu.in')) {
      setError('Only @srmist.edu.in emails are allowed');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'server error');
        return;
      }

      router.replace('/');
      router.refresh();
    } catch {
      setError('server error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(182,255,0,0.14),_transparent_42%),linear-gradient(180deg,_#050505,_#0b0b0b_55%,_#090f08)] px-6 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <GlassCard className="border border-primary/20 bg-[#101010]/85 backdrop-blur-2xl shadow-[0_0_60px_rgba(182,255,0,0.08)]">
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="font-label text-[10px] tracking-[0.3em] uppercase text-[#7c7c7c]">secure portal</p>
              <h1 className="font-headline text-5xl font-bold text-primary tracking-tighter lowercase">fcuk academia</h1>
              <p className="text-sm text-[#9a9a9a] font-body">sign in with your SRM account to load live attendance, marks, timetable, and calendar data.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="font-label text-[10px] tracking-[0.2em] uppercase text-[#808080]">SRM email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@srmist.edu.in"
                  className="w-full rounded-[20px] border border-white/10 bg-white/[0.03] px-5 py-4 text-white outline-none transition focus:border-primary/60 focus:shadow-[0_0_18px_rgba(182,255,0,0.15)]"
                />
                {!emailIsValid ? <p className="text-xs text-error font-body">Only @srmist.edu.in emails are allowed.</p> : null}
              </div>

              <div className="space-y-2">
                <label className="font-label text-[10px] tracking-[0.2em] uppercase text-[#808080]">password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="enter your password"
                  className="w-full rounded-[20px] border border-white/10 bg-white/[0.03] px-5 py-4 text-white outline-none transition focus:border-primary/60 focus:shadow-[0_0_18px_rgba(182,255,0,0.15)]"
                />
              </div>

              {error ? <p className="text-sm font-body text-error">{error}</p> : null}

              <Button
                type="submit"
                fullWidth
                className="!rounded-[20px] !py-4 !text-sm !tracking-[0.25em] !uppercase !shadow-[0_0_28px_rgba(182,255,0,0.28)]"
                disabled={loading}
              >
                {loading ? 'entering...' : 'enter system'}
              </Button>
            </form>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
