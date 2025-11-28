import './BunnySprite.css'

interface BunnySpriteProps {
  size?: 'small' | 'medium' | 'large'
  animation?: 'idle' | 'hop' | 'celebrate' | 'moving'
  direction?: 'left' | 'right'
}

export const BunnySprite = ({ 
  size = 'medium', 
  animation = 'idle',
  direction = 'right'
}: BunnySpriteProps) => {
  return (
    <div 
      className={`bunny-sprite bunny-sprite--${size} bunny-sprite--${animation} bunny-sprite--${direction}`}
      role="img"
      aria-label="Bunny"
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="bunny-sprite__svg"
      >
        {/* Bunny body */}
        <ellipse cx="50" cy="65" rx="25" ry="20" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1"/>
        
        {/* Bunny head */}
        <circle cx="50" cy="40" r="22" fill="#fafafa" stroke="#d0d0d0" strokeWidth="1"/>
        
        {/* Left ear */}
        <ellipse cx="38" cy="25" rx="6" ry="18" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1"/>
        <ellipse cx="38" cy="28" rx="4" ry="12" fill="#ffb6c1"/>
        
        {/* Right ear */}
        <ellipse cx="62" cy="25" rx="6" ry="18" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1"/>
        <ellipse cx="62" cy="28" rx="4" ry="12" fill="#ffb6c1"/>
        
        {/* Left eye */}
        <circle cx="43" cy="38" r="3" fill="#333"/>
        <circle cx="44" cy="37" r="1" fill="#fff"/>
        
        {/* Right eye */}
        <circle cx="57" cy="38" r="3" fill="#333"/>
        <circle cx="58" cy="37" r="1" fill="#fff"/>
        
        {/* Nose */}
        <ellipse cx="50" cy="45" rx="2" ry="1.5" fill="#ff69b4"/>
        
        {/* Mouth */}
        <path d="M 50 47 Q 45 50 50 52 Q 55 50 50 47" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
        
        {/* Left paw */}
        <ellipse cx="35" cy="70" rx="5" ry="8" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1"/>
        
        {/* Right paw */}
        <ellipse cx="65" cy="70" rx="5" ry="8" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1"/>
        
        {/* Tail */}
        <circle cx="25" cy="60" r="8" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1"/>
      </svg>
    </div>
  )
}

export default BunnySprite

