import Link from '@/components/Link/Link';
import SocialLinks from '@/components/SocialLinks/SocialLinks';

// the strips are only as wide as their content; a pseudo element runs the
// colour off the top (rose) and bottom (amber) edges of the screen, and the
// overflow-hidden on <main> trims it there
const stripClasses =
  'relative p-large max-w-[calc(var(--container-reading)/2)]';
const roseStrip = `${stripClasses} bg-rose-700 text-day before:content-[''] before:absolute before:inset-x-0 before:bottom-full before:h-screen before:bg-rose-700`;
const amberStrip = `${stripClasses} bg-amber-300 after:content-[''] after:absolute after:inset-x-0 after:top-full after:h-screen after:bg-amber-300`;

export default function Home() {
  return (
    <main className="font-mulish min-h-screen overflow-hidden bg-day text-jet grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center justify-center md:justify-end">
        <div className="flex flex-col">
          <div className={`${roseStrip} flex gap-4 items-center`}>
            <h1 className="text-4xl flex flex-col justify-around self-stretch">
              <span>Alastair</span>
              <span>Smith</span>
            </h1>
            <span className="text-8xl">/</span>
            <SocialLinks />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center md:justify-start">
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
