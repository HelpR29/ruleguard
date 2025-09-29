/**
 * Advanced UI/UX Enhancements
 * Micro-interactions, enhanced dark mode, and improved responsive design
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

// =============================================================================
// MICRO-INTERACTIONS & ANIMATIONS
// =============================================================================

/**
 * Smooth fade-in animation component
 */
export const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  distance = 20,
  once = true,
  className = ''
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  once?: boolean;
  className?: string;
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: distance, opacity: 0 };
      case 'down': return { y: -distance, opacity: 0 };
      case 'left': return { x: distance, opacity: 0 };
      case 'right': return { x: -distance, opacity: 0 };
      default: return { opacity: 0 };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: getInitialPosition(),
        visible: {
          x: 0,
          y: 0,
          opacity: 1,
          transition: {
            duration,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94]
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Staggered animation for lists
 */
export const StaggeredList = ({
  children,
  staggerDelay = 0.1,
  className = ''
}: {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * Hover scale animation
 */
export const HoverScale = ({
  children,
  scale = 1.05,
  className = ''
}: {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}) => {
  return (
    <motion.div
      whileHover={{
        scale,
        transition: { type: 'spring', stiffness: 400, damping: 10 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Button press animation
 */
export const PressAnimation = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.button
      whileTap={{
        scale: 0.95,
        transition: { type: 'spring', stiffness: 400, damping: 17 }
      }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

/**
 * Loading skeleton component
 */
export const Skeleton = ({
  width = '100%',
  height = '20px',
  className = '',
  variant = 'rounded'
}: {
  width?: string;
  height?: string;
  className?: string;
  variant?: 'rounded' | 'circular' | 'rectangular';
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    rounded: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none'
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

/**
 * Skeleton loader for cards
 */
export const CardSkeleton = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`rounded-2xl p-6 card-surface ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton width="40px" height="40px" variant="circular" />
          <div className="space-y-2">
            <Skeleton width="120px" height="16px" />
            <Skeleton width="80px" height="14px" />
          </div>
        </div>
        <Skeleton width="100%" height="24px" />
        <Skeleton width="100%" height="24px" />
        <div className="flex gap-2">
          <Skeleton width="60px" height="32px" />
          <Skeleton width="60px" height="32px" />
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced loading spinner with animation
 */
export const LoadingSpinner = ({
  size = 'md',
  color = 'blue',
  className = ''
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'gray';
  className?: string;
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
      className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    >
      <svg
        className="w-full h-full"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
};

// =============================================================================
// ENHANCED DARK MODE
// =============================================================================

/**
 * Enhanced theme-aware component
 */
export const ThemeCard = ({
  children,
  className = '',
  variant = 'default'
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
}) => {
  const { theme } = useTheme();

  const variants = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg border border-gray-200',
    outlined: 'bg-transparent border-2 border-gray-300',
    filled: 'bg-gray-50 border border-gray-200'
  };

  return (
    <motion.div
      className={`rounded-2xl p-6 transition-all duration-300 ${variants[variant]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Gradient text component
 */
export const GradientText = ({
  children,
  className = '',
  gradient = 'blue-purple'
}: {
  children: React.ReactNode;
  className?: string;
  gradient?: 'blue-purple' | 'green-blue' | 'purple-pink' | 'orange-red';
}) => {
  const gradients = {
    'blue-purple': 'from-blue-600 to-purple-600',
    'green-blue': 'from-green-600 to-blue-600',
    'purple-pink': 'from-purple-600 to-pink-600',
    'orange-red': 'from-orange-500 to-red-500'
  };

  return (
    <span className={`bg-gradient-to-r ${gradients[gradient]} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
};

// =============================================================================
// RESPONSIVE DESIGN ENHANCEMENTS
// =============================================================================

/**
 * Responsive grid component
 */
export const ResponsiveGrid = ({
  children,
  minWidth = '300px',
  gap = '1rem',
  className = ''
}: {
  children: React.ReactNode[];
  minWidth?: string;
  gap?: string;
  className?: string;
}) => {
  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
        gap
      }}
    >
      {children}
    </div>
  );
};

/**
 * Mobile-optimized card component
 */
export const MobileCard = ({
  children,
  className = '',
  padding = 'medium'
}: {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
}) => {
  const paddingClasses = {
    none: 'p-0',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  return (
    <motion.div
      className={`rounded-2xl card-surface ${paddingClasses[padding]} ${className}`}
      whileHover={{
        y: -2,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
    >
      {children}
    </motion.div>
  );
};

// =============================================================================
// INTERACTIVE COMPONENTS
// =============================================================================

/**
 * Interactive counter with animation
 */
export const AnimatedCounter = ({
  value,
  duration = 1,
  className = ''
}: {
  value: number;
  duration?: number;
  className?: string;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      setDisplayValue(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <motion.span
      className={className}
      key={value}
      initial={{ scale: 1.2, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
    >
      {displayValue.toLocaleString()}
    </motion.span>
  );
};

/**
 * Progress bar with smooth animation
 */
export const AnimatedProgressBar = ({
  progress,
  className = '',
  showPercentage = false,
  color = 'blue'
}: {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) => {
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600'
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full h-3 ${className}`}>
      <motion.div
        className={`h-3 rounded-full ${colors[color]}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {showPercentage && (
        <motion.span
          className="text-xs text-gray-600 mt-1 block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {progress.toFixed(1)}%
        </motion.span>
      )}
    </div>
  );
};

/**
 * Floating action button with hover effects
 */
export const FloatingActionButton = ({
  children,
  onClick,
  className = '',
  variant = 'primary'
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <motion.button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg ${variants[variant]} ${className}`}
      whileHover={{
        scale: 1.1,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20
      }}
    >
      {children}
    </motion.button>
  );
};

// =============================================================================
// ACCESSIBILITY ENHANCEMENTS
// =============================================================================

/**
 * Focus trap for modals
 */
export const FocusTrap = ({
  children,
  isActive
}: {
  children: React.ReactNode;
  isActive: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isActive]);

  return <div ref={containerRef}>{children}</div>;
};

/**
 * Screen reader only text
 */
export const ScreenReaderText = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span className={`sr-only ${className}`}>
      {children}
    </span>
  );
};

/**
 * High contrast mode support
 */
export const HighContrastWrapper = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (isHighContrast) {
    return (
      <div className={`border-2 border-black ${className}`}>
        {children}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

// =============================================================================
// PERFORMANCE OPTIMIZATIONS
// =============================================================================

/**
 * Lazy image component with blur placeholder
 */
export const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder = 'blur'
}: {
  src: string;
  alt: string;
  className?: string;
  placeholder?: 'blur' | 'empty';
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {placeholder === 'blur' && !isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {isInView && (
        <motion.img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          initial={{ scale: 1.1, filter: 'blur(10px)' }}
          animate={{
            scale: isLoaded ? 1 : 1.1,
            filter: isLoaded ? 'blur(0px)' : 'blur(10px)'
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
};

// =============================================================================
// THEME HOOK
// =============================================================================

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  return {
    theme,
    effectiveTheme,
    systemTheme,
    setTheme,
    toggleTheme,
    isDark: effectiveTheme === 'dark',
    isLight: effectiveTheme === 'light'
  };
};
