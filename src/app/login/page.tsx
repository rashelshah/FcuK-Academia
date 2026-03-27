'use client';

import type { CSSProperties, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailIsValid = !email || email.trim().toLowerCase().endsWith('@srmist.edu.in');

  useEffect(() => {
    router.prefetch('/');
  }, [router]);

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
    } catch {
      setError('server error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={
        {
          '--color-primary': 'var(--primary)',
          '--color-accent': 'var(--accent)',
          '--color-bg': 'var(--background)',
          '--color-text': 'var(--text)',
        } as CSSProperties
      }
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 22%, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 26%), radial-gradient(circle at 84% 16%, color-mix(in srgb, var(--color-accent) 7%, transparent) 0%, transparent 22%), linear-gradient(180deg, color-mix(in srgb, var(--color-bg) 98%, black 2%) 0%, color-mix(in srgb, var(--color-bg) 99%, black 1%) 100%)',
        }}
      />

      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <div
          className="absolute left-[-10px] top-[158px] font-headline text-[250px] font-bold lowercase leading-[0.78] tracking-[-0.1em]"
          style={{ color: 'var(--color-text)' }}
        >
          fc
        </div>
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[375px] flex-col px-[23px] pb-[18px] pt-[38px]">
        <div className="flex-1">
          <div
            className="inline-flex h-[23px] items-center border px-[10px] text-[10px] font-medium uppercase tracking-[0.38em]"
            style={{
              borderColor: 'color-mix(in srgb, var(--color-primary) 18%, #7c7f76 82%)',
              color: 'color-mix(in srgb, var(--color-text) 72%, #8a8e82 28%)',
              background: 'color-mix(in srgb, var(--color-bg) 92%, transparent)',
            }}
          >
            node::auth_required
          </div>

          <div className="mt-[34px]">
            <h1
              className="font-headline text-[62px] font-bold leading-[0.9] tracking-[-0.075em]"
              style={{ color: 'var(--color-text)' }}
            >
              <span className="block normal-case">FcuK</span>
              <span
                className="block normal-case"
                style={{ color: 'color-mix(in srgb, var(--color-primary) 82%, var(--color-text) 18%)' }}
              >
                Academia
              </span>
            </h1>
          </div>

          <p
            className="mt-[26px] text-[12px] font-medium uppercase tracking-[0.16em]"
            style={{ color: 'color-mix(in srgb, var(--color-text) 36%, #6a6d66 64%)' }}
          >
            {'// enter credentials to sync state'}
          </p>

          <form className="mt-[42px]" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="flex items-center gap-[9px] text-[11px] font-medium uppercase tracking-[0.28em]"
                style={{ color: 'color-mix(in srgb, var(--color-text) 55%, #71756d 45%)' }}
              >
                <span
                  className="h-[6px] w-[6px] rounded-full"
                  style={{
                    background: 'var(--color-primary)',
                    boxShadow: '0 0 10px color-mix(in srgb, var(--color-primary) 78%, transparent)',
                  }}
                />
                SRM EMAIL
              </label>

              <div className="mt-[22px] border-b pb-[15px]" style={{ borderColor: 'color-mix(in srgb, var(--color-text) 18%, transparent)' }}>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="user@srmist.edu.in"
                  aria-invalid={!emailIsValid}
                  className="login-placeholder login-placeholder-email h-[34px] w-full bg-transparent text-[18px] font-semibold tracking-[-0.03em] outline-none"
                  style={{
                    color: 'color-mix(in srgb, var(--color-text) 20%, #494c48 80%)',
                    caretColor: 'var(--color-primary)',
                  }}
                  onFocus={(event) => {
                    event.currentTarget.parentElement?.style.setProperty(
                      'border-color',
                      'color-mix(in srgb, var(--color-primary) 55%, transparent)'
                    );
                    event.currentTarget.parentElement?.style.setProperty(
                      'box-shadow',
                      '0 14px 20px -18px color-mix(in srgb, var(--color-primary) 75%, transparent), inset 0 -1px 0 color-mix(in srgb, var(--color-primary) 65%, transparent)'
                    );
                  }}
                  onBlur={(event) => {
                    event.currentTarget.parentElement?.style.setProperty(
                      'border-color',
                      'color-mix(in srgb, var(--color-text) 18%, transparent)'
                    );
                    event.currentTarget.parentElement?.style.removeProperty('box-shadow');
                  }}
                />
              </div>
              {!emailIsValid ? (
                <p className="mt-[10px] text-[11px] uppercase tracking-[0.18em]" style={{ color: '#ff7a68' }}>
                  only @srmist.edu.in emails are allowed
                </p>
              ) : null}
            </div>

            <div className="mt-[41px]">
              <label
                htmlFor="password"
                className="flex items-center gap-[9px] text-[11px] font-medium uppercase tracking-[0.28em]"
                style={{ color: 'color-mix(in srgb, var(--color-text) 55%, #71756d 45%)' }}
              >
                <span
                  className="h-[6px] w-[6px] rounded-full"
                  style={{
                    background: 'color-mix(in srgb, var(--color-accent) 68%, #3fb0c9 32%)',
                    boxShadow: '0 0 8px color-mix(in srgb, var(--color-accent) 38%, transparent)',
                  }}
                />
                PASSWORD
              </label>

              <div
                className="mt-[22px] flex items-center gap-3 border-b pb-[15px]"
                style={{ borderColor: 'color-mix(in srgb, var(--color-text) 18%, transparent)' }}
              >
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="login-placeholder login-placeholder-password h-[34px] min-w-0 flex-1 bg-transparent text-[18px] font-semibold tracking-[0.02em] outline-none"
                  style={{
                    color: 'color-mix(in srgb, var(--color-text) 20%, #5a5d59 80%)',
                    caretColor: 'var(--color-primary)',
                  }}
                  onFocus={(event) => {
                    event.currentTarget.parentElement?.style.setProperty(
                      'border-color',
                      'color-mix(in srgb, var(--color-primary) 55%, transparent)'
                    );
                    event.currentTarget.parentElement?.style.setProperty(
                      'box-shadow',
                      '0 14px 20px -18px color-mix(in srgb, var(--color-primary) 75%, transparent), inset 0 -1px 0 color-mix(in srgb, var(--color-primary) 65%, transparent)'
                    );
                  }}
                  onBlur={(event) => {
                    event.currentTarget.parentElement?.style.setProperty(
                      'border-color',
                      'color-mix(in srgb, var(--color-text) 18%, transparent)'
                    );
                    event.currentTarget.parentElement?.style.removeProperty('box-shadow');
                  }}
                />

                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((value) => !value)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-transform active:scale-95"
                  style={{ color: 'color-mix(in srgb, var(--color-text) 42%, #73766f 58%)' }}
                >
                  {showPassword ? <EyeOff size={17} strokeWidth={1.9} /> : <Eye size={17} strokeWidth={1.9} />}
                </button>
              </div>
            </div>

            {error ? (
              <p className="mt-[16px] text-[11px] uppercase tracking-[0.18em]" style={{ color: '#ff7a68' }}>
                {error}
              </p>
            ) : null}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.985 }}
              className="mt-[54px] flex h-[74px] w-full items-center justify-between rounded-full px-[36px] text-[20px] font-black uppercase tracking-[-0.06em] disabled:cursor-not-allowed"
              style={{
                background: 'var(--color-primary)',
                color: 'color-mix(in srgb, var(--color-bg) 78%, black 22%)',
                boxShadow:
                  '0 18px 40px rgba(0, 0, 0, 0.36), 0 0 24px color-mix(in srgb, var(--color-primary) 26%, transparent)',
              }}
            >
              <span className="font-headline text-[22px] lowercase tracking-[-0.09em]">
                {loading ? 'entering...' : 'enter system'}
              </span>
              <ArrowRight size={28} strokeWidth={2.15} />
            </motion.button>
          </form>
        </div>

        <div className="mt-[32px]">
          <div className="flex items-center gap-[12px]">
            <div className="h-px w-[28px]" style={{ background: 'color-mix(in srgb, var(--color-text) 20%, transparent)' }} />
            <span
              className="text-[11px] font-medium uppercase tracking-[0.3em]"
              style={{ color: 'color-mix(in srgb, var(--color-text) 30%, #666963 70%)' }}
            >
              lost your key?
            </span>
          </div>

          <div className="mt-[26px] border-t pt-[24px]" style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
            <div className="flex items-end justify-between">
              <div
                className="text-[11px] uppercase leading-[1.75] tracking-[0.22em]"
                style={{ color: 'color-mix(in srgb, var(--color-text) 26%, #666963 74%)' }}
              >
                <p>ver 4.0.2 // encrypted</p>
                <p style={{ color: 'color-mix(in srgb, var(--color-text) 52%, #8b8f86 48%)' }}>status: awaiting_input</p>
              </div>

              <div className="flex items-end gap-[4px] pb-[2px]">
                <span className="block h-[13px] w-[4px]" style={{ background: 'color-mix(in srgb, var(--color-text) 18%, transparent)' }} />
                <span className="block h-[22px] w-[4px]" style={{ background: 'color-mix(in srgb, var(--color-text) 34%, transparent)' }} />
                <span className="block h-[17px] w-[4px]" style={{ background: 'color-mix(in srgb, var(--color-primary) 45%, var(--color-text) 55%)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .login-placeholder::placeholder {
          opacity: 1;
        }

        .login-placeholder-email::placeholder {
          color: color-mix(in srgb, var(--color-text) 18%, #474a46 82%);
        }

        .login-placeholder-password::placeholder {
          color: color-mix(in srgb, var(--color-text) 22%, #515550 78%);
        }
      `}</style>
    </main>
  );
}
