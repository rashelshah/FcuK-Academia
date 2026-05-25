import { ArrowIcon } from "@/components/wrapped/icons";

type NavigationButtonsProps = {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  disablePrev?: boolean;
  disableNext?: boolean;
  hidePrev?: boolean;
  hideNext?: boolean;
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function NavigationButtons({
  label,
  onPrev,
  onNext,
  disablePrev,
  disableNext,
  hidePrev,
  hideNext
}: NavigationButtonsProps) {
  return (
    <div className="relative z-30 px-2 pb-[calc(env(safe-area-inset-bottom)+1.1rem)]">
      <div className="mx-auto grid max-w-[21.25rem] grid-cols-[4rem_1fr_4rem] items-center rounded-full border border-white/15 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-2 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        {hidePrev ? (
          <div aria-hidden className="h-16 w-16" />
        ) : (
          <button
            aria-label="Previous slide"
            className={cx(
              "flex h-16 w-16 items-center justify-center rounded-full bg-[#ee67bb] text-[#0b0809] transition-transform duration-300",
              !disablePrev && "active:scale-95"
            )}
            disabled={disablePrev}
            onClick={onPrev}
            type="button"
          >
            <ArrowIcon className="rotate-180" />
          </button>
        )}
        <div className="px-4 text-center text-[1.05rem] tracking-wide text-white sm:text-[1.15rem]">
          <span className="font-[var(--font-imfell)] text-[2rem] leading-none">
            {label}
          </span>
        </div>
        {hideNext ? (
          <div aria-hidden className="h-16 w-16" />
        ) : (
          <button
            aria-label="Next slide"
            className={cx(
              "flex h-16 w-16 items-center justify-center rounded-full bg-[#ee67bb] text-[#0b0809] transition-transform duration-300",
              !disableNext && "active:scale-95"
            )}
            disabled={disableNext}
            onClick={onNext}
            type="button"
          >
            <ArrowIcon />
          </button>
        )}
      </div>
    </div>
  );
}
