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
        "relative w-full max-w-[13.5rem] rounded-[2rem] border px-4 py-4 shadow-[0_30px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        isLight
          ? "border-black/8 bg-[linear-gradient(145deg,#fffef8,#f2ece4)] text-[#0b0809]"
          : "border-white/18 bg-[linear-gradient(145deg,rgba(28,24,29,0.98),rgba(10,9,11,0.9))] text-white",
        tilt,
        className
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div
          className={cx(
            "max-w-[7.75rem] text-balance text-[1.5rem] leading-[1.02] tracking-tight",
            "font-[var(--font-madimi)]"
          )}
        >
          {title}
        </div>
        <div
          className={cx(
            "flex h-14 w-14 items-center justify-center rounded-full border",
            isLight ? "border-black/10 bg-[#0b0809] text-white" : "border-black/10 bg-white text-[#0b0809]"
          )}
        >
          {icon}
        </div>
      </div>
      <div
        className={cx(
          "text-[2.95rem] leading-none tracking-tight",
          isLight ? "text-[#0b0809]" : "text-white",
          "font-[var(--font-madimi)]"
        )}
      >
        {value}
      </div>
      {helper ? (
        <p className={cx("mt-3 text-sm leading-snug", isLight ? "text-black/60" : "text-white/60")}>
          {helper}
        </p>
      ) : null}
    </div>
  );
}
