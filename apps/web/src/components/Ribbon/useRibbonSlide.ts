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

// measured against the document so that scrolling doesn't count
const cornerOf = (ribbon: HTMLElement): corner => {
  const { top, left } = ribbon.getBoundingClientRect();
  return { top: top + window.scrollY, left: left + window.scrollX };
};

// a slide still playing would skew the reading, so cancel it first
const settledCornerOf = (ribbon: HTMLElement) => {
  for (const animation of ribbon.getAnimations()) animation.cancel();
  return cornerOf(ribbon);
};

/*
 * The ribbons leave the way they hang: off the side of a phone screen, off the
 * top and bottom of a desktop one. Going sideways they hold their homepage
 * height and walk off the edge, rather than cutting a diagonal to wherever the
 * grid has parked them.
 */
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

/*
 * The grid does the layout, so the ribbons jump between routes. This hands back
 * the refs to hang on them, then replays each jump as a slide from where the
 * ribbon was on the outgoing page.
 */
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
