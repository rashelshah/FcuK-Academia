type IconProps = {
  className?: string;
};

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function ArrowIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cx("h-5 w-5", className)}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 5L15 12L8 19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

export function GroupIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cx("h-5 w-5", className)}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.5 16.5C5.5 14.55 7.52 13 10 13C12.48 13 14.5 14.55 14.5 16.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="10" cy="9" r="2.4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M14.5 15.5C14.9 14.25 16.28 13.3 17.9 13.3C19.81 13.3 21.35 14.62 21.35 16.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="17.6" cy="9.4" r="1.95" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function MobileCheckIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cx("h-5 w-5", className)}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="7"
        y="2.75"
        width="10"
        height="18.5"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M10 13.2L11.8 15L14.8 10.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function MoodIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cx("h-5 w-5", className)}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8.75 14.4C9.55 15.55 10.84 16.2 12.25 16.2C13.66 16.2 14.95 15.55 15.75 14.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="9.45" cy="10.1" r="1.1" fill="currentColor" />
      <circle cx="15.05" cy="10.1" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function TwinkleStarIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cx("h-5 w-5", className)}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3.2L13.7 10.3L20.8 12L13.7 13.7L12 20.8L10.3 13.7L3.2 12L10.3 10.3L12 3.2Z"
        fill="currentColor"
      />
    </svg>
  );
}
