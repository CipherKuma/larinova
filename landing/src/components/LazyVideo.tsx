"use client";

import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";

interface LazyVideoProps extends Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "src"
> {
  src: string;
  /** Distance from viewport to start loading (default: "200px") */
  rootMargin?: string;
}

export function LazyVideo({
  src,
  rootMargin = "200px",
  className,
  ...props
}: LazyVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      {/* Shimmer placeholder — visible until video is loaded */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${isLoaded ? "opacity-0" : "opacity-100"}`}
        aria-hidden
      >
        <div className="h-full w-full animate-pulse bg-white/[0.04]" />
      </div>

      {isInView && (
        <video
          ref={videoRef}
          src={src}
          onLoadedData={() => setIsLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          {...props}
        />
      )}
    </div>
  );
}
