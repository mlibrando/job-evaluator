'use client';

import { useEffect } from 'react';
import { animate, createScope, createTimeline, onScroll, stagger, utils } from 'animejs';

/**
 * Scroll-driven motion for the landing page, wired up from data attributes so
 * the page itself stays a server component:
 *
 * - `data-hero` / `data-hero-item`: staggered intro on load.
 * - `data-parallax="<px>"`: drifts up by <px> while the hero scrolls away.
 * - `data-reveal`: fades up once when it scrolls into view.
 * - `data-reveal-group` + `data-reveal-item`: children fade up in a stagger.
 *   Inside a group, `data-count` numbers tick up from 0 and `data-draw`
 *   lines grow from the left.
 *
 * Elements start hidden via CSS (see globals.css) only when the visitor
 * allows motion, so reduced-motion users get the static page untouched.
 */
export function LandingMotion() {
  useEffect(() => {
    const scope = createScope({
      mediaQueries: { reduceMotion: '(prefers-reduced-motion: reduce)' },
    }).add((self) => {
      if (self?.matches.reduceMotion) return;

      const hero = document.querySelector<HTMLElement>('[data-hero]');
      if (hero) {
        createTimeline({ defaults: { ease: 'out(4)' } })
          .add(hero.querySelectorAll('[data-hero-item]'), {
            opacity: [0, 1],
            y: [28, 0],
            duration: 900,
            delay: stagger(110),
          })
          .add(
            '[data-hero-preview]',
            { opacity: [0, 1], y: [48, 0], scale: [0.96, 1], duration: 1100 },
            '-=750'
          )
          .add(
            '[data-hero-callout]',
            { opacity: [0, 1], x: [-24, 0], rotate: [-4, 0], duration: 800, ease: 'outBack(1.6)' },
            '-=500'
          );

        document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
          animate(el, {
            y: [0, -Number(el.dataset.parallax)],
            ease: 'linear',
            autoplay: onScroll({ target: hero, enter: 'top top', leave: 'top bottom', sync: 0.4 }),
          });
        });
      }

      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        animate(el, {
          opacity: [0, 1],
          y: [36, 0],
          duration: 900,
          ease: 'out(4)',
          autoplay: onScroll({ target: el, enter: 'bottom-=12% top', repeat: false }),
        });
      });

      document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
        const items = group.querySelectorAll<HTMLElement>('[data-reveal-item]');
        const lines = group.querySelectorAll<HTMLElement>('[data-draw]');
        const counters = group.querySelectorAll<HTMLElement>('[data-count]');

        // Counters render their real value server-side; zero them only once
        // we know they'll be animated back up.
        counters.forEach((el) => (el.textContent = '0'));

        const timeline = createTimeline({
          defaults: { ease: 'out(4)' },
          autoplay: onScroll({ target: group, enter: 'bottom-=12% top', repeat: false }),
        });

        if (lines.length) {
          timeline.add(lines, { scaleX: [0, 1], duration: 900, delay: stagger(140) }, 0);
        }
        timeline.add(
          items,
          { opacity: [0, 1], y: [40, 0], scale: [0.97, 1], duration: 900, delay: stagger(110) },
          lines.length ? 200 : 0
        );
        counters.forEach((el, i) => {
          timeline.add(
            el,
            {
              innerHTML: [0, Number(el.dataset.count)],
              modifier: utils.round(0),
              duration: 1200,
              ease: 'out(3)',
            },
            300 + i * 120
          );
        });
      });
    });

    return () => scope.revert();
  }, []);

  return null;
}
