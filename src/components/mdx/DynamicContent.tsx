'use client';

/**
 * Simple component for rendering dynamic content
 * Useful for displaying current date, year, time, etc. in MDX
 */
export function DynamicDate() {
  return <>{new Date().toLocaleDateString()}</>;
}

export function DynamicYear() {
  return <>{new Date().getFullYear()}</>;
}

export function DynamicTime() {
  return <>{new Date().toLocaleTimeString()}</>;
}

export function DynamicRandom({ max = 100 }: { max?: number }) {
  return <>{Math.floor(Math.random() * max)}</>;
}
