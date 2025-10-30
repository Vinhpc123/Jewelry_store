export default function IllustrationPanel() {
  return (
    <div className="hidden lg:flex items-center justify-center">
      <div className="relative">
        <div className="absolute -left-8 -top-8 w-24 h-24 rounded-full bg-purple-100" />
        <PhoneIllustration />
      </div>
    </div>
  );
}

function PhoneIllustration() {
  return (
    <svg
      width="520"
      height="420"
      viewBox="0 0 520 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-sm"
    >
      <defs>
        <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <path d="M60 180c0-70 80-120 150-110 100 15 160 40 200 90 60 75-20 170-130 180-85 8-220-30-220-160z" fill="#F3F4F6" />
      <g transform="translate(40,60)">
        <circle r="58" cx="60" cy="60" fill="#F3E8FF" />
        <circle r="48" cx="60" cy="60" fill="white" stroke="#A78BFA" strokeWidth="6" />
        <rect x="52" y="65" width="16" height="18" rx="4" fill="#A78BFA" />
        <path d="M68 66v-8a8 8 0 10-16 0v8" stroke="#A78BFA" strokeWidth="6" strokeLinecap="round" />
      </g>
      <g transform="translate(180,60)">
        <rect x="0" y="0" width="170" height="300" rx="18" fill="white" stroke="#1118270f" />
        <rect x="6" y="6" width="158" height="288" rx="14" fill="#11182708" />
        <rect x="22" y="110" width="126" height="86" rx="8" fill="url(#grad1)" />
        <circle cx="85" cy="84" r="18" fill="white" />
        <path d="M85 76a8 8 0 018 8v6H77v-6a8 8 0 018-8z" fill="#A78BFA" />
        <rect x="44" y="140" width="82" height="14" rx="7" fill="white" opacity="0.9" />
        <rect x="58" y="164" width="54" height="12" rx="6" fill="white" opacity="0.9" />
      </g>
      <g transform="translate(80,250)">
        <circle cx="40" cy="24" r="16" fill="#A78BFA" />
        <rect x="22" y="44" width="36" height="72" rx="18" fill="#C4B5FD" />
        <rect x="0" y="84" width="80" height="14" rx="7" fill="#EDE9FE" />
      </g>
    </svg>
  );
}