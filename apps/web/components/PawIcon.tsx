/**
 * PawConnect logo mark, modeled on a cat's paw seen from below:
 * black paw silhouette with four spaced pink toe beans arced over a
 * tri-lobed central pad.
 */
export function PawIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <ellipse cx="32" cy="32" rx="25" ry="26" fill="#1C1917" />
      <g fill="#D98F96">
        {/* toe beans, outer pair angled inward */}
        <ellipse cx="14.5" cy="27" rx="4" ry="5.4" transform="rotate(-28 14.5 27)" />
        <ellipse cx="24.5" cy="18.5" rx="4.2" ry="5.8" transform="rotate(-10 24.5 18.5)" />
        <ellipse cx="39.5" cy="18.5" rx="4.2" ry="5.8" transform="rotate(10 39.5 18.5)" />
        <ellipse cx="49.5" cy="27" rx="4" ry="5.4" transform="rotate(28 49.5 27)" />
        {/* tri-lobed central pad */}
        <circle cx="25" cy="38.5" r="5.2" />
        <circle cx="32" cy="36.5" r="5.6" />
        <circle cx="39" cy="38.5" r="5.2" />
        <ellipse cx="32" cy="44" rx="12" ry="7" />
      </g>
    </svg>
  );
}
