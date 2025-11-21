interface AvatarProps {
  type: 'male' | 'female';
  variant?: number;
  size?: number;
}

export function Avatar({ type, variant = 1, size = 96 }: AvatarProps) {
  if (type === 'male') {
    return <MaleAvatar variant={variant} size={size} />;
  }
  return <FemaleAvatar variant={variant} size={size} />;
}

function MaleAvatar({ variant, size }: { variant: number; size: number }) {
  const avatars = [
    // Variant 1: 짧은 머리 남성
    <svg key="male-1" width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="50" fill="#3B82F6" />
      <circle cx="50" cy="45" r="25" fill="#FDB4B4" />
      <path d="M30 35 Q30 25 40 25 Q45 20 50 20 Q55 20 60 25 Q70 25 70 35 L70 45 Q70 50 65 50 L35 50 Q30 50 30 45 Z" fill="#8B5A3C" />
      <circle cx="40" cy="42" r="3" fill="#1F2937" />
      <circle cx="60" cy="42" r="3" fill="#1F2937" />
      <path d="M45 52 Q50 54 55 52" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
      <rect x="25" y="65" width="50" height="30" rx="5" fill="#4B5563" />
    </svg>,
    
    // Variant 2: 웨이브 머리 남성
    <svg key="male-2" width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="50" fill="#8B5CF6" />
      <circle cx="50" cy="45" r="25" fill="#FDB4B4" />
      <path d="M28 32 Q28 22 35 20 Q40 18 45 20 Q48 18 50 18 Q52 18 55 20 Q60 18 65 20 Q72 22 72 32 L72 45 Q72 50 67 50 L33 50 Q28 50 28 45 Z" fill="#2C1810" />
      <path d="M30 28 Q35 24 40 28 Q45 24 50 28 Q55 24 60 28 Q65 24 70 28" stroke="#1F1310" strokeWidth="2" fill="none" />
      <circle cx="40" cy="42" r="3" fill="#1F2937" />
      <circle cx="60" cy="42" r="3" fill="#1F2937" />
      <path d="M45 52 Q50 54 55 52" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
      <rect x="25" y="65" width="50" height="30" rx="5" fill="#6366F1" />
    </svg>,
    
    // Variant 3: 스포티 남성
    <svg key="male-3" width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="50" fill="#10B981" />
      <circle cx="50" cy="45" r="25" fill="#FDB4B4" />
      <path d="M32 30 L32 45 Q32 50 37 50 L63 50 Q68 50 68 45 L68 30 Q68 24 62 22 L38 22 Q32 24 32 30 Z" fill="#D97706" />
      <rect x="35" y="20" width="30" height="5" rx="2" fill="#92400E" />
      <circle cx="40" cy="42" r="3" fill="#1F2937" />
      <circle cx="60" cy="42" r="3" fill="#1F2937" />
      <path d="M44 50 Q50 53 56 50" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
      <rect x="25" y="65" width="50" height="30" rx="5" fill="#059669" />
    </svg>,
    
    // Variant 4: 비즈니스 남성
    <svg key="male-4" width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="50" fill="#1F2937" />
      <circle cx="50" cy="45" r="25" fill="#FDB4B4" />
      <path d="M30 35 Q30 25 38 23 Q44 22 50 22 Q56 22 62 23 Q70 25 70 35 L70 42 Q70 48 65 48 L35 48 Q30 48 30 42 Z" fill="#374151" />
      <rect x="38" y="22" width="24" height="4" rx="2" fill="#1F2937" />
      <circle cx="40" cy="42" r="3" fill="#1F2937" />
      <circle cx="60" cy="42" r="3" fill="#1F2937" />
      <path d="M45 52 Q50 54 55 52" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
      <rect x="25" y="65" width="50" height="30" rx="5" fill="#374151" />
      <line x1="50" y1="65" x2="50" y2="95" stroke="#1F2937" strokeWidth="2" />
    </svg>,
  ];

  return avatars[variant - 1] || avatars[0];
}

function FemaleAvatar({ variant, size }: { variant: number; size: number }) {
  const avatars = [
    // Variant 1: 긴 생머리 여성
    <svg key="female-1" width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="50" fill="#EC4899" />
      <circle cx="50" cy="45" r="25" fill="#FDB4B4" />
      <path d="M28 30 Q28 20 35 18 Q42 16 50 16 Q58 16 65 18 Q72 20 72 30 L72 55 Q72 58 68 60 L65 75 Q65 78 62 78 L38 78 Q35 78 35 75 L32 60 Q28 58 28 55 Z" fill="#7C2D12" />
      <circle cx="39" cy="42" r="3" fill="#1F2937" />
      <circle cx="61" cy="42" r="3" fill="#1F2937" />
      <path d="M44 52 Q50 54 56 52" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="42" cy="48" r="2" fill="#FCA5A5" opacity="0.6" />
      <circle cx="58" cy="48" r="2" fill="#FCA5A5" opacity="0.6" />
      <rect x="25" y="65" width="50" height="30" rx="5" fill="#DB2777" />
    </svg>,
    
    // Variant 2: 포니테일 여성
    <svg key="female-2" width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="50" fill="#A855F7" />
      <circle cx="50" cy="45" r="25" fill="#FDB4B4" />
      <path d="M30 32 Q30 22 38 18 Q44 16 50 16 Q56 16 62 18 Q70 22 70 32 L70 48 Q70 52 65 52 L35 52 Q30 52 30 48 Z" fill="#D97706" />
      <ellipse cx="72" cy="35" rx="8" ry="22" fill="#D97706" />
      <path d="M72 20 Q75 18 78 22 L78 48 Q75 52 72 50" fill="#B45309" />
      <circle cx="39" cy="42" r="3" fill="#1F2937" />
      <circle cx="61" cy="42" r="3" fill="#1F2937" />
      <path d="M44 52 Q50 54 56 52" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="42" cy="48" r="2" fill="#FCA5A5" opacity="0.6" />
      <circle cx="58" cy="48" r="2" fill="#FCA5A5" opacity="0.6" />
      <rect x="25" y="65" width="50" height="30" rx="5" fill="#9333EA" />
    </svg>,
    
    // Variant 3: 숏컷 여성
    <svg key="female-3" width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="50" fill="#F97316" />
      <circle cx="50" cy="45" r="25" fill="#FDB4B4" />
      <path d="M32 30 Q32 22 38 18 Q44 16 50 16 Q56 16 62 18 Q68 22 68 30 L68 38 Q68 44 65 46 Q62 48 58 48 L42 48 Q38 48 35 46 Q32 44 32 38 Z" fill="#2C1810" />
      <circle cx="39" cy="42" r="3" fill="#1F2937" />
      <circle cx="61" cy="42" r="3" fill="#1F2937" />
      <path d="M44 52 Q50 54 56 52" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="42" cy="48" r="2" fill="#FCA5A5" opacity="0.6" />
      <circle cx="58" cy="48" r="2" fill="#FCA5A5" opacity="0.6" />
      <rect x="25" y="65" width="50" height="30" rx="5" fill="#EA580C" />
    </svg>,
    
    // Variant 4: 웨이브 헤어 여성
    <svg key="female-4" width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="50" fill="#06B6D4" />
      <circle cx="50" cy="45" r="25" fill="#FDB4B4" />
      <path d="M26 28 Q26 18 34 16 Q42 14 50 14 Q58 14 66 16 Q74 18 74 28 L74 52 Q74 58 70 62 Q68 64 65 64 L35 64 Q32 64 30 62 Q26 58 26 52 Z" fill="#92400E" />
      <path d="M28 30 Q32 26 36 30 Q40 26 44 30 Q48 26 52 30 Q56 26 60 30 Q64 26 68 30 Q72 26 74 30" stroke="#78350F" strokeWidth="2" fill="none" />
      <path d="M26 40 Q24 38 24 45 Q24 50 26 52" stroke="#78350F" strokeWidth="2" fill="none" />
      <path d="M74 40 Q76 38 76 45 Q76 50 74 52" stroke="#78350F" strokeWidth="2" fill="none" />
      <circle cx="39" cy="42" r="3" fill="#1F2937" />
      <circle cx="61" cy="42" r="3" fill="#1F2937" />
      <path d="M44 52 Q50 54 56 52" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="42" cy="48" r="2" fill="#FCA5A5" opacity="0.6" />
      <circle cx="58" cy="48" r="2" fill="#FCA5A5" opacity="0.6" />
      <rect x="25" y="65" width="50" height="30" rx="5" fill="#0891B2" />
    </svg>,
  ];

  return avatars[variant - 1] || avatars[0];
}

export function AvatarSelector({ 
  selectedAvatar, 
  onSelect 
}: { 
  selectedAvatar: { type: 'male' | 'female'; variant: number } | null;
  onSelect: (type: 'male' | 'female', variant: number) => void;
}) {
  const maleVariants = [1, 2, 3, 4];
  const femaleVariants = [1, 2, 3, 4];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold mb-3">남성 아바타</h3>
        <div className="grid grid-cols-4 gap-3">
          {maleVariants.map((variant) => (
            <button
              key={`male-${variant}`}
              onClick={() => onSelect('male', variant)}
              className={`rounded-2xl p-2 transition-all ${
                selectedAvatar?.type === 'male' && selectedAvatar?.variant === variant
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 ring-4 ring-purple-400/50'
                  : 'bg-white/5 hover:bg-white/10 border border-white/20'
              }`}
            >
              <Avatar type="male" variant={variant} size={64} />
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-white font-semibold mb-3">여성 아바타</h3>
        <div className="grid grid-cols-4 gap-3">
          {femaleVariants.map((variant) => (
            <button
              key={`female-${variant}`}
              onClick={() => onSelect('female', variant)}
              className={`rounded-2xl p-2 transition-all ${
                selectedAvatar?.type === 'female' && selectedAvatar?.variant === variant
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 ring-4 ring-purple-400/50'
                  : 'bg-white/5 hover:bg-white/10 border border-white/20'
              }`}
            >
              <Avatar type="female" variant={variant} size={64} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
