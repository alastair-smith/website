import { useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { defaultButtonClasses } from '@/components/Button/Button';
import Link from '@/components/Link/Link';
import { ProfileRibbon, ProjectsRibbon } from '@/components/Ribbon/Ribbon';
import { metadataFor } from '@/pages';

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

// measured against the document so that scrolling doesn't count
const cornerOf = (ribbon: HTMLElement): corner => {
  const { top, left } = ribbon.getBoundingClientRect();
  return { top: top + window.scrollY, left: left + window.scrollX };
};

// a slide still playing would skew the reading, so drop back to the corner the
// grid has settled the ribbon into
const settledCornerOf = (ribbon: HTMLElement) => {
  for (const animation of ribbon.getAnimations()) animation.cancel();
  return cornerOf(ribbon);
};

// the ribbons leave the way they hang: off the side of a phone screen, off the
// top and bottom of a desktop one. Going sideways they hold the height they
// keep on the homepage and walk off the edge, rather than cutting a diagonal to
// wherever the grid has parked them
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

// index.html describes the site as a whole, which is what anything that
// doesn't run scripts will read. Once react-router is in charge the route gets
// to speak for itself
const useMetadata = (pathname: string) => {
  useEffect(() => {
    const { title, description } = metadataFor(pathname);
    const set = (selector: string, attribute: string, value: string) =>
      document.querySelector(selector)?.setAttribute(attribute, value);

    document.title = title;
    set('meta[name="description"]', 'content', description);
    set('meta[property="og:title"]', 'content', title);
    set('meta[property="og:description"]', 'content', description);
    set('link[rel="canonical"]', 'href', window.location.href);
    set('meta[property="og:url"]', 'content', window.location.href);
  }, [pathname]);
};

export default function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  useMetadata(pathname);

  const profile = useRef<HTMLDivElement>(null);
  const projects = useRef<HTMLDivElement>(null);
  const ribbons = () =>
    [profile.current, projects.current].filter((ribbon) => ribbon !== null);

  const departingCorners = useRef(new WeakMap<HTMLElement, corner>());
  const shownPathname = useRef<string | null>(null);

  // the page being navigated away from is still on screen while this render
  // runs, so it is the last chance to see where the ribbons are before the grid
  // moves them
  if (shownPathname.current !== null && shownPathname.current !== pathname) {
    for (const ribbon of ribbons()) {
      departingCorners.current.set(ribbon, cornerOf(ribbon));
    }
  }

  // the ribbons are laid out by the grid, so the move between the two states is
  // played back afterwards: start each one where it used to be, then let it go
  useLayoutEffect(() => {
    if (shownPathname.current === pathname) return;
    shownPathname.current = pathname;

    const reduceMotion = prefersReducedMotion();

    for (const ribbon of ribbons()) {
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
  });

  return (
    <div
      className={`font-mulish relative min-h-screen overflow-hidden bg-day text-jet grid grid-cols-1 lg:grid-cols-2 gap-y-2 lg:gap-y-0 lg:gap-x-large [align-content:safe_center] [--ribbons-leave:sideways] lg:[--ribbons-leave:vertically] ${
        isHome
          ? 'grid-rows-[auto_auto_auto_auto]'
          : 'grid-rows-[0px_auto_1fr_0px]'
      }`}
    >
      <a
        href="#main-content"
        className={`mx-small focus:my-small focus:outline-none absolute -translate-y-full focus:translate-y-0 z-10 ${defaultButtonClasses}`}
      >
        Skip to main content
      </a>

      <ProfileRibbon
        className={`row-start-1 lg:col-start-1 ${
          isHome
            ? ''
            : '-translate-x-full lg:translate-x-0 lg:-translate-y-full'
        }`}
        inert={!isHome}
        ref={profile}
      />

      {/* the ribbons paint over the rest of the page, so the red one takes its
          bleed off the top of the screen with it and leaves this behind */}
      {!isHome && (
        <header className="row-start-2 col-span-full flex justify-center py-medium">
          <div className="w-[calc(100%-2rem)] max-w-reading">
            <Link href="/">alsmith.dev</Link>
          </div>
        </header>
      )}

      <main
        className="row-start-3 col-span-full flex justify-center"
        id="main-content"
      >
        <Outlet />
      </main>

      <ProjectsRibbon
        className={`row-start-4 lg:col-start-2 ${
          isHome ? 'lg:row-start-1' : 'translate-x-full lg:translate-x-0'
        }`}
        inert={!isHome}
        ref={projects}
      />
    </div>
  );
}
