"use client";

import { useId } from "react";

/**
 * Sabeel TaskFlow mark: an open progress ring wrapped around a checkmark.
 * The artwork sits on a transparent background — there is no filled tile
 * behind it — so it drops cleanly onto any surface.
 *
 * `mono` renders the mark in `currentColor` for use on coloured backgrounds
 * (the login panel), otherwise it uses the brand gradient.
 *
 * The gradient id comes from `useId()` because several Logos can be on the
 * page at once (sidebar + mobile header). A shared id would make them all
 * resolve to the first definition, which is inside a `display:none` element
 * at some breakpoints — leaving the visible logo unpainted.
 */
export default function Logo({
  size = 32,
  className,
  mono = false,
}: {
  size?: number;
  className?: string;
  mono?: boolean;
}) {
  const gradientId = `logo-gradient-${useId()}`;
  const stroke = mono ? "currentColor" : `url(#${gradientId})`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Sabeel TaskFlow logo"
    >
      {!mono && (
        <defs>
          <linearGradient id={gradientId} x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
      )}

      {/* Progress ring, left open where the checkmark points so the mark reads
          as work flowing out to "done". r=15 -> circumference 94.25; the dash
          pair leaves an 80deg gap, rotated to sit at the upper right. */}
      <circle
        cx="20"
        cy="20"
        r="15"
        stroke={stroke}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray="73.3 20.95"
        transform="rotate(2.5 20 20)"
      />

      {/* checkmark */}
      <path
        d="M13.2 20.4L17.6 24.8L27 14.6"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
