'use client';

import { useEffect, useState } from 'react';
import { useSpring, useMotionValueEvent } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  format = (n) => Math.round(n).toString(),
  className = '',
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(() => format(0));
  const spring = useSpring(0, { damping: 28, stiffness: 180 });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useMotionValueEvent(spring, 'change', (v) => setDisplay(format(v)));

  return <span className={className} aria-label={format(value)}>{display}</span>;
}
