/**
 * PawConnect logo mark: a paw print — four separated toes arced above a
 * tri-lobed main pad, each with a pink bean inset. The shape itself is the
 * silhouette (no enclosing circle), so the negative space reads as a paw.
 */
export function PawIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {/* paw silhouette */}
      <g fill="#1C1917">
        <ellipse cx="11" cy="26" rx="6.4" ry="8" transform="rotate(-25 11 26)" />
        <ellipse cx="24" cy="17" rx="6.8" ry="8.8" transform="rotate(-10 24 17)" />
        <ellipse cx="40" cy="17" rx="6.8" ry="8.8" transform="rotate(10 40 17)" />
        <ellipse cx="53" cy="26" rx="6.4" ry="8" transform="rotate(25 53 26)" />
        <circle cx="20" cy="40" r="8.5" />
        <circle cx="32" cy="37.5" r="9.5" />
        <circle cx="44" cy="40" r="8.5" />
        <ellipse cx="32" cy="46" rx="15" ry="10" />
      </g>
      {/* pink toe beans and central pad */}
      <g fill="#E39AA1">
        <ellipse cx="11" cy="26" rx="3.4" ry="4.4" transform="rotate(-25 11 26)" />
        <ellipse cx="24" cy="17.5" rx="3.6" ry="4.8" transform="rotate(-10 24 17.5)" />
        <ellipse cx="40" cy="17.5" rx="3.6" ry="4.8" transform="rotate(10 40 17.5)" />
        <ellipse cx="53" cy="26" rx="3.4" ry="4.4" transform="rotate(25 53 26)" />
        <circle cx="23.5" cy="40.5" r="5" />
        <circle cx="32" cy="38.5" r="5.6" />
        <circle cx="40.5" cy="40.5" r="5" />
        <ellipse cx="32" cy="45" rx="9.5" ry="6.5" />
      </g>
    </svg>
  );
}
