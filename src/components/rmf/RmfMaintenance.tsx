import React from 'react';

export function RmfMaintenance() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <div 
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-full"
        style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}
      >
        <span className="text-4xl">🫠</span>
      </div>
      <h1 className="font-headline text-4xl font-bold tracking-tight text-primary italic">
        Resuming Shortly
      </h1>
      <p className="mt-4 max-w-xs font-body text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        We&apos;ve hit our database limit for this month! Rate My Faculty will be back online very soon.
      </p>
      <div className="mt-8 h-[1px] w-12" style={{ background: 'var(--border)' }} />
      <p className="mt-4 font-label text-[10px] font-bold uppercase tracking-widest opacity-40">
        coming back next month
      </p>
    </div>
  );
}
