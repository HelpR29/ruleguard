import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Check } from 'lucide-react';

const progressObjects = {
  beer: { 
    emoji: '🍺', 
    name: 'Beer', 
    spillAnimation: '💧', 
    refillAnimation: '✨',
    completionSound: 'pop',
    violationSound: 'splash'
  },
  wine: { 
    emoji: '🍷', 
    name: 'Wine', 
    spillAnimation: '🍇', 
    refillAnimation: '🌟',
    completionSound: 'clink',
    violationSound: 'pour'
  },
  donut: { 
    emoji: '🍩', 
    name: 'Donut', 
    spillAnimation: '🍪', 
    refillAnimation: '⭐',
    completionSound: 'bite',
    violationSound: 'crumble'
  },
  diamond: { 
    emoji: '💎', 
    name: 'Diamond', 
    spillAnimation: '💔', 
    refillAnimation: '💫',
    completionSound: 'shine',
    violationSound: 'crack'
  },
  trophy: { 
    emoji: '🏆', 
    name: 'Trophy', 
    spillAnimation: '😢', 
    refillAnimation: '🎉',
    completionSound: 'victory',
    violationSound: 'fall'
  },
};

interface AnimatedProgressIconProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
}

export default function AnimatedProgressIcon({ size = 'xl' }: AnimatedProgressIconProps) {
  const { settings } = useUser();
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'complete' | 'violation' | 'idle' | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; emoji: string; delay: number }>>([]);

  const object = progressObjects[settings.progressObject];

  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-28 h-28',
    large: 'w-36 h-36',
    xl: 'w-80 h-80'
  };

  // Idle animation cycle
  useEffect(() => {
    const idleInterval = setInterval(() => {
      if (!isAnimating) {
        setAnimationType('idle');
        setTimeout(() => setAnimationType(null), 2000);
      }
    }, 8000);

    return () => clearInterval(idleInterval);
  }, [isAnimating]);

  const triggerAnimation = (type: 'complete' | 'violation') => {
    setIsAnimating(true);
    setAnimationType(type);
    
    // Create enhanced particle effect
    const particleCount = type === 'complete' ? 12 : 8;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 300 - 150,
      y: Math.random() * 300 - 150,
      emoji: type === 'complete' ? object.refillAnimation : object.spillAnimation,
      delay: i * 0.1
    }));
    
    setParticles(newParticles);
    
    // Reset minor effects if any
    
    setTimeout(() => {
      setIsAnimating(false);
      setAnimationType(null);
      setParticles([]);
    }, 3000);
  };

  const getAnimationClasses = () => {
    switch (animationType) {
      case 'complete':
        return 'animate-bounce scale-110 brightness-125';
      case 'violation':
        return 'animate-shake grayscale scale-95 opacity-75';
      case 'idle':
        return 'animate-float';
      default:
        return 'hover:scale-105 transition-transform duration-300';
    }
  };

  // (Removed unused realistic mug renderer)

  const renderGenericObject = () => (
    <div className={`
      ${sizeClasses[size]} 
      flex items-center justify-center relative text-9xl
      ${getAnimationClasses()}
    `}>
      
      {/* Background Glow */}
      {animationType === 'complete' && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-blue-400 opacity-20 animate-pulse blur-xl"></div>
      )}
      
      {/* Crack Overlay for Violations */}
      {animationType === 'violation' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-red-500 text-6xl animate-pulse opacity-80">💥</div>
        </div>
      )}
      
      {/* Main Object */}
      <span className={`
        relative z-20 transition-all duration-500
        ${animationType === 'complete' ? 'animate-spin-slow filter drop-shadow-lg' : ''}
        ${animationType === 'violation' ? 'blur-sm' : ''}
      `}>
        {object.emoji}
      </span>
      
      {/* Completion Sparkles */}
      {animationType === 'complete' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-yellow-400 text-4xl animate-ping">✨</div>
          <div className="text-yellow-300 text-3xl animate-ping animation-delay-300 absolute top-4 right-4">⭐</div>
          <div className="text-yellow-500 text-2xl animate-ping animation-delay-500 absolute bottom-4 left-4">💫</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative flex items-center justify-center">
      {/* Main Icon - All Objects Use Generic Rendering */}
      {renderGenericObject()}

      {/* Simple Particle Effects for Completion */}
      {animationType === 'complete' && particles.slice(0, 3).map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-bounce pointer-events-none z-30 opacity-80"
          style={{
            left: `calc(50% + ${particle.x / 3}px)`,
            top: `calc(50% + ${particle.y / 3}px)`,
            animationDelay: `${particle.delay}s`,
            animationDuration: '1.5s'
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
}

interface ProgressGridProps {
}

export function ProgressGrid({}: ProgressGridProps) {
  const { settings, progress } = useUser();
  const [animatingItems, setAnimatingItems] = useState<Set<number>>(new Set());
  const [nextPulse, setNextPulse] = useState(false);

  const object = progressObjects[settings.progressObject];
  const total = settings.targetCompletions;
  const completed = progress.completions;
  const nextPct = Math.max(0, Math.min(100, (progress.nextProgressPct / Math.max(1e-9, settings.growthPerCompletion)) * 100));

  // Subtle pulse when partial progress increases or a completion is added
  const prevRef = React.useRef({ completions: progress.completions, nextPctRaw: progress.nextProgressPct });
  React.useEffect(() => {
    const prev = prevRef.current;
    if (progress.completions !== prev.completions || progress.nextProgressPct > prev.nextPctRaw) {
      setNextPulse(true);
      const t = setTimeout(() => setNextPulse(false), 700);
      return () => clearTimeout(t);
    }
    prevRef.current = { completions: progress.completions, nextPctRaw: progress.nextProgressPct };
  }, [progress.completions, progress.nextProgressPct]);

  return (
    <div className="grid grid-cols-10 gap-2 max-w-lg mx-auto">
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < completed;
        const isNext = i === completed;
        const isAnimating = animatingItems.has(i);
        
        return (
          <div
            key={i}
            className={`relative w-12 h-12 rounded-lg grid place-items-center text-3xl transition-all duration-200 ${
              isDone ? 'bg-green-50 border-2 border-green-200' : 
              isNext ? 'bg-blue-50 border-2 border-blue-300' : 
              'bg-gray-100 border-2 border-gray-200 opacity-50'
            } ${
              isAnimating ? (isDone ? 'animate-shake' : 'animate-bounce') : ''
            }`}
            title={isNext ? `Next item progress: ${nextPct.toFixed(0)}% (need ${(Math.max(0, 100 - nextPct)).toFixed(0)}%)` : isDone ? 'Completed' : 'Not available yet'}
          >
            <span className={`transition-all duration-300 ${
              isDone ? 'opacity-40 scale-75' : 
              isNext ? 'opacity-100 scale-100' : 
              'opacity-30 scale-90'
            } ${
              isAnimating && isDone ? 'animate-pulse' : ''
            }`}>
              {object.emoji}
            </span>
            
            {isDone && (
              <div className="absolute inset-0 grid place-items-center">
                <div className={`transition-all duration-300 ${
                  isAnimating ? 'animate-ping' : ''
                }`}>
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>
            )}
            
            {/* Breaking effect for violations */}
            {isAnimating && isDone && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-red-500 text-2xl animate-bounce">💥</div>
              </div>
            )}
            
            {/* Partial progress bar for the next item */}
            {isNext && (
              <div className="absolute left-0 right-0 bottom-0 h-1.5 bg-blue-100 overflow-hidden rounded-b-[6px]">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                  style={{ width: `${nextPct}%` }}
                />
              </div>
            )}

            {/* Completion sparkles */}
            {/* Passive celebratory ping when next progress pulses */}
            {isNext && nextPulse && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-yellow-400 text-xl animate-ping">✨</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}