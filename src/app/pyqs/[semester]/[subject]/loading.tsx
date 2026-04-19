export default function PYQListLoading() {
  return (
    <div className="flex flex-col gap-5">
      {/* Filter pills skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['All', 'PYQ', 'CT'].map((f) => (
          <div
            key={f}
            className="h-7 w-14 flex-shrink-0 animate-pulse rounded-full"
            style={{ background: 'var(--surface-elevated)' }}
          />
        ))}
      </div>

      {/* Count skeleton */}
      <div
        className="h-2.5 w-28 animate-pulse rounded-full"
        style={{ background: 'var(--surface-elevated)' }}
      />

      {/* PYQ card skeletons */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="theme-card flex items-start justify-between gap-3 p-5"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="flex flex-col gap-2.5 flex-1">
              {/* Badges */}
              <div className="flex gap-2">
                <div
                  className="h-5 w-10 animate-pulse rounded-full"
                  style={{ background: 'var(--surface-elevated)' }}
                />
                <div
                  className="h-5 w-14 animate-pulse rounded-full"
                  style={{ background: 'var(--surface-elevated)' }}
                />
              </div>
              {/* Title */}
              <div
                className="h-4 animate-pulse rounded-full"
                style={{ background: 'var(--surface-elevated)', width: `${60 + (i % 4) * 9}%` }}
              />
              {/* Sub */}
              <div
                className="h-3 w-32 animate-pulse rounded-full"
                style={{ background: 'var(--surface-elevated)' }}
              />
            </div>
            {/* Button skeleton */}
            <div
              className="h-16 w-14 flex-shrink-0 animate-pulse rounded-2xl"
              style={{ background: 'var(--surface-elevated)' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
