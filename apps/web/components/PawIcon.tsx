/** PawConnect logo mark: black paw pad with pink toe beans. */
export function PawIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g fill="#D18C93">
        <ellipse cx="12.5" cy="29" rx="6.5" ry="8.5" transform="rotate(-24 12.5 29)" />
        <ellipse cx="51.5" cy="29" rx="6.5" ry="8.5" transform="rotate(24 51.5 29)" />
        <ellipse cx="24.5" cy="15.5" rx="7" ry="9.5" transform="rotate(-8 24.5 15.5)" />
        <ellipse cx="39.5" cy="15.5" rx="7" ry="9.5" transform="rotate(8 39.5 15.5)" />
      </g>
      <path
        fill="#1C1917"
        d="M32 30c-9.8 0-17.2 7.3-17.2 14.8 0 5.5 4.4 9 8.8 9 3 0 5.5-1.4 8.4-1.4s5.4 1.4 8.4 1.4c4.4 0 8.8-3.5 8.8-9C49.2 37.3 41.8 30 32 30z"
      />
    </svg>
  );
}
