'use client';

interface HomeFooterProps {
  title: string;
}

export default function HomeFooter({ title }: HomeFooterProps) {
  return (
    <footer className="mt-24 px-6 pb-3">
      <div className="flex flex-col gap-4 text-left">
        <p
          className="font-headline text-[clamp(3.2rem,14vw,4.4rem)] font-bold leading-[0.88] tracking-tight"
          style={{ color: 'color-mix(in srgb, var(--text) 90%, transparent)' }}
        >
          {title}
        </p>
        <p className="max-w-sm text-sm leading-7 text-on-surface-variant">
          Crafted to make the SRM grind feel a little less brutal and a lot more alive.
        </p>
      </div>
    </footer>
  );
}
