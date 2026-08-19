import { Link, Outlet } from 'react-router-dom';
import { defaultButtonClasses } from '@/components/Button/Button';
import SocialLinks from '@/components/SocialLinks/SocialLinks';

export default function Layout() {
  return (
    <div className="font-mulish grid grid-rows-[auto,1fr,auto] min-h-screen bg-day text-jet">
      <a
        href="#main-content"
        className={`mx-small focus:my-small focus:outline-none absolute -translate-y-full focus:translate-y-0 z-10 ${defaultButtonClasses}`}
      >
        Skip to main content
      </a>

      <header className="py-4 row-start-1 row-end-2 flex justify-center">
        <div className="w-[calc(100%-2rem)] max-w-reading">
          <Link
            className="focus:outline-none focus:ring-4 ring-violet-500 rounded py-tiny my-tiny text-xl"
            to="/"
          >
            alsmith.dev
          </Link>
        </div>
      </header>

      <main
        className="row-start-2 row-end-3 flex justify-center"
        id="main-content"
      >
        <Outlet />
      </main>

      <footer className="py-huge row-start-3 row-end-4 flex flex-col items-center">
        <hr className="h-1 w-[calc(100%-2rem)] max-w-reading my-10 border-jet" />
        <div className="flex justify-center">
          <SocialLinks className="mx-medium" />
        </div>
      </footer>
    </div>
  );
}
