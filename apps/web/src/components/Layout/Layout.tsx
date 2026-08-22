import { Outlet, useLocation } from 'react-router-dom';
import { defaultButtonClasses } from '@/components/Button/Button';
import Link from '@/components/Link/Link';
import { ProfileRibbon, ProjectsRibbon } from '@/components/Ribbon/Ribbon';
import { useRibbonSlide } from '@/components/Ribbon/useRibbonSlide';
import { useMetadata } from '@/useMetadata';

export default function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  useMetadata(pathname);

  const { profile, projects } = useRibbonSlide(pathname, isHome);

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

      {/* the rose ribbon takes the top bleed with it and leaves this behind */}
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
