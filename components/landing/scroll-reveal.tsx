'use client';

import { useEffect } from 'react';

/**
 * Fades `[data-reveal]` elements up into place the first time they scroll
 * into view. Renders nothing — the page stays a server component and just
 * tags the elements it wants revealed (see the `[data-reveal]` rules in
 * globals.css).
 *
 * Only elements still below the fold on mount are hidden, so nothing already
 * on screen flickers, and with JS off or reduced motion requested the page
 * renders exactly as it would without this.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const pending = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]')).filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight
    );
    if (pending.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = 'shown';
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    for (const el of pending) {
      el.dataset.reveal = 'pending';
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
