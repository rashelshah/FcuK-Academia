import type { ReactNode } from "react";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type StatCardProps = {
  title: string;
  value: string;
  helper?: string;
  icon: ReactNode;
  tone?: "light" | "dark";
  tilt?: string;
  className?: string;
};

export function StatCard({
  title,
  value,
  helper,
  icon,
  tone = "dark",
  tilt,
  className
}: StatCardProps) {
  const isLight = tone === "light";

  return (
    <div
      className={cx(
        "relative w-full max-w-[12.8rem] rounded-[1.8rem] border px-4 py-4 shadow-[0_30px_60px_rgba(0,0,0,0.35)]",
        isLight
          ? "border-black/8 bg-[linear-gradient(145deg,#fffef8,#f2ece4)] text-[#0b0809]"
          : "border-white/18 bg-[#1a1520] text-white",
        tilt,
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={cx(
            "max-w-[7.4rem] text-balance text-[1.4rem] leading-[1.02] tracking-tight",
            "font-[var(--font-madimi)]"
          )}
        >
          {title}
        </div>
        <div
          className={cx(
            "flex h-12 w-12 items-center justify-center rounded-full border flex-shrink-0",
            isLight ? "border-black/10 bg-[#0b0809] text-white" : "border-black/10 bg-white text-[#0b0809]"
          )}
        >
          {icon}
        </div>
      </div>
      <div
        className={cx(
          "text-[2.7rem] leading-none tracking-tight",
          isLight ? "text-[#0b0809]" : "text-white",
          "font-[var(--font-madimi)]"
        )}
      >
        {value}
      </div>
      {helper ? (
        <p className={cx("mt-2.5 text-xs leading-snug", isLight ? "text-black/60" : "text-white/60")}>
          {helper}
        </p>
      ) : null}
    </div>
  );
}
