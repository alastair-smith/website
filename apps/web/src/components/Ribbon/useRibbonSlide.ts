import { type RefObject, useLayoutEffect, useRef } from 'react';

type corner = {
  top: number;
  left: number;
};

const slide = {
  duration: 500,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ribbonsOf = (...refs: RefObject<HTMLDivElement | null>[]) =>
  refs.map((ref) => ref.current).filter((ribbon) => ribbon !== null);

const cornerOf = (ribbon: HTMLElement): corner => {
  const { top, left } = ribbon.getBoundingClientRect();
  return { top: top + window.scrollY, left: left + window.scrollX };
};

// a slide still playing would skew the reading, so cancel it first
const settledCornerOf = (ribbon: HTMLElement) => {
  for (const animation of ribbon.getAnimations()) animation.cancel();
  return cornerOf(ribbon);
};

/** Ribons on mobile move horizontally, on desktop they go vertically. */
const travelOf = (
  ribbon: HTMLElement,
  x: number,
  y: number,
  isHome: boolean,
) => {
  const leaves = getComputedStyle(ribbon)
    .getPropertyValue('--ribbons-leave')
    .trim();

  if (leaves !== 'sideways') return [`translate(${x}px, ${y}px)`, 'none'];

  const held = isHome ? 0 : y;

  return [`translate(${x}px, ${held}px)`, `translate(0px, ${held}px)`];
};

export const useRibbonSlide = (pathname: string, isHome: boolean) => {
  const profile = useRef<HTMLDivElement>(null);
  const projects = useRef<HTMLDivElement>(null);

  const departingCorners = useRef(new WeakMap<HTMLElement, corner>());
  const shownPathname = useRef<string | null>(null);

  // the outgoing page is still on screen: the last look at the ribbons
  if (shownPathname.current !== null && shownPathname.current !== pathname) {
    for (const ribbon of ribbonsOf(profile, projects)) {
      departingCorners.current.set(ribbon, cornerOf(ribbon));
    }
  }

  useLayoutEffect(() => {
    // StrictMode remounts effects, and a replayed slide is not a new one
    if (shownPathname.current === pathname) return;
    shownPathname.current = pathname;

    const reduceMotion = prefersReducedMotion();

    for (const ribbon of ribbonsOf(profile, projects)) {
      const departing = departingCorners.current.get(ribbon);
      const settled = settledCornerOf(ribbon);

      if (reduceMotion || departing === undefined) continue;

      const x = departing.left - settled.left;
      const y = departing.top - settled.top;

      if (x === 0 && y === 0) continue;

      const [from, to] = travelOf(ribbon, x, y, isHome);

      ribbon.animate([{ transform: from }, { transform: to }], slide);
    }

    window.scrollTo(0, 0);
  }, [pathname, isHome]);

  return { profile, projects };
};
