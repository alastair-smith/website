import Link from '@/components/Link/Link';
import SocialLinks from '@/components/SocialLinks/SocialLinks';

// on mobile the strips run off the side of the screen, leaving a margin of
// page on their inner edge; from md they instead run off the top (rose) and
// bottom (amber), carried past the edge by a pseudo element that the
// overflow-hidden on <main> trims
const stripClasses =
  'relative flex-1 p-large md:flex-none md:max-w-[calc(var(--container-reading)/2)]';
const roseStrip = `${stripClasses} mr-huge md:mr-0 bg-rose-700 text-day md:before:content-[''] md:before:absolute md:before:inset-x-0 md:before:bottom-full md:before:h-screen md:before:bg-rose-700`;
const amberStrip = `${stripClasses} ml-huge md:ml-0 bg-amber-300 md:after:content-[''] md:after:absolute md:after:inset-x-0 md:after:top-full md:after:h-screen md:after:bg-amber-300`;

export default function Home() {
  return (
    <main className="font-mulish min-h-screen overflow-hidden bg-day text-jet grid grid-cols-1 md:grid-cols-2 gap-4 content-center md:content-stretch">
      <div className="flex items-center md:justify-end">
        <div
          className={`${roseStrip} flex flex-col gap-4 md:flex-row md:items-center`}
        >
          <div className="flex gap-4 items-center">
            <h1 className="text-4xl flex flex-col md:justify-around md:self-stretch">
              <span>Alastair</span>
              <span>Smith</span>
            </h1>
            <span className="text-8xl">/</span>
          </div>
          <SocialLinks />
        </div>
      </div>

      <div className="flex items-center justify-end md:justify-start">
        <div className={amberStrip}>
          <ul className="flex flex-col gap-4">
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
              <Link
                href="/bort"
                description="Global count of people called Bort"
              >
                Bort Tracker
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
