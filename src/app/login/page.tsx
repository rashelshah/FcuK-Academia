'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';

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
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <GlassCard className="px-6 py-7 backdrop-blur-2xl" style={{ borderColor: 'var(--border-strong)' }}>
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="theme-kicker">secure portal</p>
              <h1 className="font-headline text-5xl font-bold normal-case tracking-tight text-primary">FcuK Academia</h1>
              <p className="text-sm text-on-surface-variant">
                sign in with your SRM account to load live attendance, marks, timetable, and calendar data.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="theme-kicker">SRM email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@srmist.edu.in"
                  className="theme-input px-5 py-4"
                />
                {!emailIsValid ? <p className="text-xs font-body text-error">Only @srmist.edu.in emails are allowed.</p> : null}
              </div>

              <div className="space-y-2">
                <label className="theme-kicker">password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="enter your password"
                  className="theme-input px-5 py-4"
                />
              </div>

              {error ? <p className="text-sm font-body text-error">{error}</p> : null}

              <Button
                type="submit"
                fullWidth
                className="!rounded-[20px] !py-4 !text-sm"
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
