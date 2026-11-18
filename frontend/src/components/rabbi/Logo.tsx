import React from "react";
import { Link } from "@tanstack/react-router";

export function Logo({
  size = "md",
  variant = "default",
  clickable = true,
}: {
  size?: "md" | "lg";
  variant?: "default" | "dark" | "badge";
  clickable?: boolean;
}) {
  const big = size === "lg";

  const content = (
    <div className="flex items-center gap-3 group select-none">
      <div className="relative flex flex-col items-center">
        <svg
          viewBox="0 0 24 12"
          className={`${big ? "h-3.5 w-7" : "h-2.5 w-5"} text-gold group-hover:scale-105 transition-transform`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M1 11 L2 2 L7 7 L12 0 L17 7 L22 2 L23 11 Z" />
        </svg>
        <span
          className={`font-display leading-none text-gold font-bold ${
            big ? "text-3xl" : "text-2xl"
          } group-hover:text-gold-soft transition-colors`}
        >
          R
        </span>
      </div>
      <div className="leading-tight">
        <div
          className={`font-display font-bold tracking-[0.18em] ${
            variant === "dark"
              ? "text-navy-deep group-hover:text-navy"
              : "text-white group-hover:text-gold"
          } ${big ? "text-2xl" : "text-xl"} transition-colors`}
        >
          RABBI
        </div>
        <div
          className={`text-[0.65rem] font-semibold tracking-[0.14em] transition-colors ${
            variant === "dark"
              ? "text-navy/80 group-hover:text-navy"
              : "text-gold group-hover:text-gold-soft"
          }`}
        >
          — ጌታና መምህር —
        </div>
      </div>
    </div>
  );

  const wrapped = clickable ? (
    <Link
      to="/"
      preload="intent"
      className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded-xl transition-all cursor-pointer active:scale-95"
      aria-label="RABBI Digital - ወደ ዋናው ገጽ (Home)"
    >
      {content}
    </Link>
  ) : (
    content
  );

  if (variant === "badge") {
    return (
      <div className="inline-flex items-center rounded-2xl bg-navy-deep px-7 py-3.5 border border-gold/40 shadow-xl shadow-navy-deep/20">
        {wrapped}
      </div>
    );
  }

  return wrapped;
}
