"use client";

type FloatingDecorationsProps = {
  variant: "intro" | "city" | "outro";
};

export function FloatingDecorations({ variant }: FloatingDecorationsProps) {
  if (variant === "intro") {
    return (
      <>
        <div
          aria-hidden
          className="absolute -left-16 top-18 h-44 w-44 rounded-full bg-[radial-gradient(circle,_rgba(255,102,200,0.72),_rgba(255,102,200,0.08)_58%,_transparent_75%)] blur-2xl animate-float-slow"
        />
        <div
          aria-hidden
          className="absolute right-[-2.5rem] top-32 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(124,49,151,0.85),_rgba(124,49,151,0.12)_60%,_transparent_78%)] blur-3xl animate-float-medium"
        />
        <div aria-hidden className="absolute left-8 top-[41%] text-4xl text-[#ff70ce]">
          *
        </div>
        <div
          aria-hidden
          className="absolute right-10 top-[54%] h-16 w-16 rounded-full border border-white/15"
        />
        <div
          aria-hidden
          className="absolute bottom-40 right-[-3rem] h-36 w-36 rounded-full border-[18px] border-[#ff5dc7]/85 opacity-75"
        />
      </>
    );
  }

  if (variant === "city") {
    return (
      <>
        <div
          aria-hidden
          className="absolute -bottom-12 left-1/2 h-48 w-72 -translate-x-1/2 bg-[radial-gradient(circle,_rgba(255,105,201,0.95),_rgba(255,105,201,0.26)_36%,_transparent_70%)] blur-2xl animate-pulse-slow"
        />
        <div
          aria-hidden
          className="absolute right-2 top-[68%] h-28 w-28 rounded-full border border-white/10 animate-float-slow"
        />
        <div aria-hidden className="absolute left-7 top-[75%] text-[2.1rem] text-[#ff63c8]">
          *
        </div>
        <div
          aria-hidden
          className="absolute bottom-[9.5rem] right-[-1.5rem] h-28 w-56 rotate-[-13deg] bg-[radial-gradient(circle,_rgba(255,255,255,0.12),_rgba(255,255,255,0.02)_48%,_transparent_74%)] blur-lg"
        />
      </>
    );
  }

  return (
    <>
      <div
        aria-hidden
        className="absolute left-1/2 top-[18%] h-72 w-72 -translate-x-1/2 rounded-full border border-white/10"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-[18%] h-96 w-96 -translate-x-1/2 rounded-full border border-[#ff68ca]/18"
      />
      <div
        aria-hidden
        className="absolute inset-x-10 bottom-30 h-44 rounded-full bg-[radial-gradient(circle,_rgba(255,102,200,0.52),_rgba(255,102,200,0.08)_55%,_transparent_75%)] blur-3xl animate-float-slow"
      />
      <div aria-hidden className="absolute left-9 top-[24%] text-[1.85rem] text-[#ff62c8]">
        *
      </div>
      <div aria-hidden className="absolute right-11 top-[29%] text-2xl text-white/75">
        *
      </div>
      <div
        aria-hidden
        className="absolute bottom-24 left-6 h-20 w-20 rounded-full border border-white/15"
      />
      <div
        aria-hidden
        className="absolute right-[-1.25rem] top-[58%] h-44 w-44 rounded-full border-[14px] border-[#7c3197]/45"
      />
    </>
  );
}
