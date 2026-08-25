export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex flex-col items-center">
        <svg
          viewBox="0 0 24 12"
          className={big ? "h-3 w-6 text-gold" : "h-2.5 w-5 text-gold"}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M1 11 L2 2 L7 7 L12 0 L17 7 L22 2 L23 11 Z" />
        </svg>
        <span
          className={`font-display leading-none text-gold ${big ? "text-3xl" : "text-2xl"}`}
        >
          R
        </span>
      </div>
      <div className="leading-tight">
        <div
          className={`font-display tracking-[0.18em] text-on-navy ${big ? "text-2xl" : "text-xl"}`}
        >
          RABBI
        </div>
        <div className="text-[0.6rem] tracking-[0.14em] text-gold-soft">
          — ጊታና መምህር —
        </div>
      </div>
    </div>
  );
}
