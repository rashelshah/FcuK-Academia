export default function SubjectLoading() {
  return (
    <div className="flex flex-col gap-4">
      {/* Search skeleton */}
      <div
        className="h-12 w-full animate-pulse rounded-[calc(var(--radius-md)-4px)]"
        style={{ background: 'var(--surface-elevated)' }}
      />

      {/* Count skeleton */}
      <div
        className="h-2.5 w-24 animate-pulse rounded-full"
        style={{ background: 'var(--surface-elevated)' }}
      />

      {/* Subject card skeletons */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="theme-card flex items-center gap-3 px-5 py-4"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div
              className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full"
              style={{ background: 'var(--surface-elevated)' }}
            />
            <div
              className="h-4 animate-pulse rounded-full"
              style={{
                background: 'var(--surface-elevated)',
                width: `${55 + (i % 5) * 8}%`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
