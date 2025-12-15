export default function IllustrationPanel() {
  return (
    <div className="hidden lg:flex items-center justify-center">
      <div className="relative">
        <div className="absolute -left-8 -top-10 h-24 w-24 rounded-full bg-[#f1e3d4] blur-md" />
        <div className="absolute right-[-18px] top-6 h-20 w-20 rounded-full bg-[#e6d3c0] blur-lg" />
        <JewelIllustration />
      </div>
    </div>
  );
}

function JewelIllustration() {
  return (
    <svg
      width="540"
      height="420"
      viewBox="0 0 540 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg"
    >
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6d9a9" />
          <stop offset="40%" stopColor="#e9c088" />
          <stop offset="100%" stopColor="#cda66f" />
        </linearGradient>
        <linearGradient id="pearl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff9f0" />
          <stop offset="100%" stopColor="#f1e4d7" />
        </linearGradient>
      </defs>
      <path
        d="M70 210c0-90 96-150 184-138 114 16 186 52 233 118 60 85-28 182-152 192-114 9-265-42-265-172z"
        fill="#f3e8db"
      />
      <g transform="translate(80,60)">
        <rect x="34" y="32" width="210" height="270" rx="24" fill="url(#pearl)" stroke="#e5d3c2" strokeWidth="4" />
        <rect x="52" y="58" width="175" height="220" rx="18" fill="#f9f2ea" stroke="#eddcc9" strokeWidth="2" />
        <circle cx="140" cy="100" r="30" fill="url(#gold)" stroke="#d2b48c" strokeWidth="2" />
        <path
          d="M140 82l24 26-24 30-24-30 24-26z"
          fill="#fdf6ea"
          stroke="#d7b98f"
          strokeWidth="2"
          opacity="0.9"
        />
        <rect x="86" y="170" width="108" height="12" rx="6" fill="#e5d4c2" />
        <rect x="100" y="198" width="80" height="12" rx="6" fill="#e5d4c2" />
        <rect x="96" y="226" width="120" height="14" rx="7" fill="url(#gold)" opacity="0.85" />
      </g>
      <g transform="translate(320,200)">
        <circle cx="70" cy="60" r="60" fill="url(#pearl)" stroke="#e6d5c4" strokeWidth="4" />
        <path
          d="M70 0l48 40-22 60H44L22 40 70 0z"
          fill="url(#gold)"
          stroke="#c6a06c"
          strokeWidth="3"
        />
        <circle cx="70" cy="64" r="22" fill="#fff7eb" stroke="#d9c3a3" strokeWidth="2" />
        <path d="M70 44l16 20-16 22-16-22 16-20z" fill="#f1dfc3" stroke="#d3b48b" strokeWidth="2" />
      </g>
    </svg>
  );
}
