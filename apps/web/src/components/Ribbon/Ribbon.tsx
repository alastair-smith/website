import type { Ref } from 'react';
import Link from '@/components/Link/Link';
import SocialLinks from '@/components/SocialLinks/SocialLinks';

// the ribbons bleed off the screen, so their edges show only where they meet
const ribbonClasses =
  'relative lg:w-full p-large py-huge lg:max-w-[calc(var(--container-reading)/2)]';

export type props = {
  className?: string;
  /** Content is hidden off screen. */
  inert?: boolean;
  ref?: Ref<HTMLDivElement>;
};

export const ProfileRibbon = ({ className = '', inert, ref }: props) => (
  <div
    ref={ref}
    inert={inert}
    className={`${ribbonClasses} mr-huge lg:mr-0 self-start lg:justify-self-end bg-rose-700 text-day flex flex-wrap items-center lg:justify-center gap-4 lg:before:content-[''] lg:before:absolute lg:before:inset-x-0 lg:before:bottom-full lg:before:h-screen lg:before:bg-rose-700 ${className}`}
  >
    <div className="flex gap-4 items-center">
      <h1 className="text-4xl flex flex-col lg:justify-around lg:self-stretch">
        <span>Alastair</span>
        <span>Smith</span>
      </h1>
      <span aria-hidden="true" className="text-8xl">
        /
      </span>
    </div>

    <SocialLinks />
  </div>
);

export const ProjectsRibbon = ({ className = '', inert, ref }: props) => (
  <div
    ref={ref}
    inert={inert}
    className={`${ribbonClasses} ml-huge lg:ml-0 self-start pl-huge lg:pl-large bg-amber-300 lg:after:content-[''] lg:after:absolute lg:after:inset-x-0 lg:after:top-full lg:after:h-screen lg:after:bg-amber-300 ${className}`}
  >
    <ul className="flex flex-col gap-4 w-fit ml-auto lg:mr-auto">
      <li>
        <Link
          href="https://playcards.games"
          description="Play some cards with your friends"
        >
          PlayCards.Games
        </Link>
      </li>
      <li>
        <Link href="/potter" description="Magic up a message to Harry">
          Potter Meme Generator
        </Link>
      </li>
      <li>
        <Link href="/kelly" description="Send texts in a dilemma">
          Kelly Meme Generator
        </Link>
      </li>
      <li>
        <Link href="/bort" description="Global count of people called Bort">
          Bort Tracker
        </Link>
      </li>
    </ul>
  </div>
);
