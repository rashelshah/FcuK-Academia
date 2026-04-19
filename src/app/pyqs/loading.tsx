export default function PYQLoading() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="theme-card flex flex-col gap-3 p-5"
          style={{ minHeight: '130px' }}
        >
          {/* Emoji placeholder */}
          <div
            className="h-7 w-7 animate-pulse rounded-full"
            style={{ background: 'var(--surface-elevated)' }}
          />
          {/* Label */}
          <div className="space-y-1.5">
            <div
              className="h-2 w-12 animate-pulse rounded-full"
              style={{ background: 'var(--surface-elevated)', animationDelay: `${i * 0.05}s` }}
            />
            <div
              className="h-6 w-8 animate-pulse rounded"
              style={{ background: 'var(--surface-elevated)', animationDelay: `${i * 0.07}s` }}
            />
          </div>
          <div
            className="h-2.5 w-20 animate-pulse rounded-full"
            style={{ background: 'var(--surface-elevated)', animationDelay: `${i * 0.08}s` }}
          />
        </div>
      ))}
    </div>
  );
}
