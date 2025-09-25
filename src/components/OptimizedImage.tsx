import React, { useState, useEffect, useRef } from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  srcSet?: string;
  placeholder?: string;
  blurDataURL?: string;
  priority?: boolean;
  quality?: number;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export const ResponsiveImage = React.memo(({
  src,
  alt,
  className = '',
  sizes = '100vw',
  srcSet,
  placeholder,
  blurDataURL,
  priority = false,
  quality = 75,
  width,
  height,
  onLoad,
  onError
}: ResponsiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate srcSet if not provided
  const generatedSrcSet = React.useMemo(() => {
    if (srcSet) return srcSet;

    if (!width || !height) return undefined;

    const breakpoints = [480, 768, 1024, 1280, 1920];
    return breakpoints
      .filter(bp => bp <= width)
      .map(bp => {
        const w = Math.min(bp, width);
        const h = Math.round((w / width) * height);
        return `${src}?w=${w}&h=${h}&q=${quality} ${w}w`;
      })
      .join(', ');
  }, [src, srcSet, width, height, quality]);

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          Failed to load image
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          style={{ width, height }}
        />
      )}

      {/* Placeholder */}
      {placeholder && !isLoaded && !blurDataURL && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={{ width, height }}
        />
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        srcSet={isInView ? generatedSrcSet : undefined}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
});

ResponsiveImage.displayName = 'ResponsiveImage';

// Optimized logo component
interface OptimizedLogoProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export const OptimizedLogo = React.memo(({
  src,
  alt,
  className = '',
  priority = false
}: OptimizedLogoProps) => {
  return (
    <picture className={className}>
      {/* WebP format for modern browsers */}
      <source
        srcSet={`${src}?format=webp&q=80 1x, ${src}?format=webp&q=80&dpr=2 2x`}
        type="image/webp"
      />
      {/* Fallback to original format */}
      <ResponsiveImage
        src={src}
        alt={alt}
        priority={priority}
        quality={85}
        className="w-full h-full object-contain"
      />
    </picture>
  );
});

OptimizedLogo.displayName = 'OptimizedLogo';

// Image preloader hook
export function useImagePreloader() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const preloadImage = React.useCallback(async (src: string): Promise<boolean> => {
    if (loadedImages.has(src)) return true;
    if (failedImages.has(src)) return false;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, src]));
        resolve(true);
      };
      img.onerror = () => {
        setFailedImages(prev => new Set([...prev, src]));
        resolve(false);
      };
      img.src = src;
    });
  }, [loadedImages, failedImages]);

  const preloadImages = React.useCallback(async (sources: string[]): Promise<boolean[]> => {
    const promises = sources.map(src => preloadImage(src));
    return Promise.all(promises);
  }, [preloadImage]);

  const isImageLoaded = React.useCallback((src: string) => {
    return loadedImages.has(src);
  }, [loadedImages]);

  const hasImageFailed = React.useCallback((src: string) => {
    return failedImages.has(src);
  }, [failedImages]);

  return {
    preloadImage,
    preloadImages,
    isImageLoaded,
    hasImageFailed,
    loadedCount: loadedImages.size,
    failedCount: failedImages.size,
  };
}
