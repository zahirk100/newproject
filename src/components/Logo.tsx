export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ width: size * 0.55, height: size * 0.55 }}
        >
          <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
        </svg>
      </div>
      <span className="text-lg font-semibold tracking-tight">OfferteFlits</span>
    </div>
  );
}
