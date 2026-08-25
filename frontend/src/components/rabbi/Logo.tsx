import React from "react";

export function Logo({
  size = "md",
  variant = "default",
}: {
  size?: "md" | "lg";
  variant?: "default" | "dark" | "badge";
}) {
  const big = size === "lg";

  const content = (
    <div className="flex items-center gap-3">
      <div className="relative flex flex-col items-center">
        <svg
          viewBox="0 0 24 12"
          className={big ? "h-3.5 w-7 text-gold" : "h-2.5 w-5 text-gold"}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M1 11 L2 2 L7 7 L12 0 L17 7 L22 2 L23 11 Z" />
        </svg>
        <span
          className={`font-display leading-none text-gold font-bold ${
            big ? "text-3xl" : "text-2xl"
          }`}
        >
          R
        </span>
      </div>
      <div className="leading-tight">
        <div
          className={`font-display font-bold tracking-[0.18em] ${
            variant === "dark"
              ? "text-navy-deep"
              : "text-white"
          } ${big ? "text-2xl" : "text-xl"}`}
        >
          RABBI
        </div>
        <div
          className={`text-[0.65rem] font-semibold tracking-[0.14em] ${
            variant === "dark" ? "text-navy/80" : "text-gold"
          }`}
        >
          — ጌታና መምህር —
        </div>
      </div>
    </div>
  );

  if (variant === "badge") {
    return (
      <div className="inline-flex items-center rounded-2xl bg-navy-deep px-7 py-3.5 border border-gold/40 shadow-xl shadow-navy-deep/20">
        {content}
      </div>
    );
  }

  return content;
}
