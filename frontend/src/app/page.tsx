import Image from 'next/image';
import Link from 'next/link';

import UnderlinedLink from '@/components/UnderlinedLink/UnderlinedLink';

export default function Home() {
  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col px-medium py-huge items-center">
        <h1 className="font-black text-[min(calc(2.25rem+8vw),196px)] leading-none uppercase self-center mb-large">
          Alastair
          <br />
          Smith
        </h1>
        <div className="max-w-reading flex flex-col">
          <p className="mb-small">Welcome to my personal website!</p>

          <p className="mb-small">
            I&apos;m a software engineer based in the UK, and this is my online
            space where I share some of my hobby projects. It&apos;s a platform
            where I can showcase a variety of coding experiments and explore new
            ideas beyond my professional software work.
          </p>

          <p className="mb-small">
            Here, you&apos;ll find a collection of applications and coding
            projects that I&apos;ve brought to life. This website reflects my
            passion for coding and my curiosity in discovering new
            possibilities.
          </p>

          <p className="mb-small">
            Feel free to explore and discover the projects I&apos;ve been
            tinkering with. If you have any questions, ideas, or just want to
            connect, please reach out!
          </p>

          <p className="mb-small">
            Thank you for visiting, and I hope you enjoy exploring my hobby
            projects!
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="max-w-reading mx-medium py-medium flex flex-col items-center space-y-4">
          <h2 className="text-3xl">Kelly</h2>
          <span>Meme Generator</span>
          <Image
            src="/excel.png"
            alt="excel"
            width="512"
            height="512"
            className="border-8 border-night rounded"
          />
          <div className="flex space-x-4">
            <UnderlinedLink href="/kelly">Go to app</UnderlinedLink>
            <span>|</span>
            <UnderlinedLink href="/kelly/about">Read about</UnderlinedLink>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="max-w-reading mx-medium py-medium flex flex-col items-center space-y-4">
          <h2 className="text-3xl">Bort</h2>
          <span>Track number of Borts</span>
          <Image
            src="/bort-licence.png"
            alt="bort"
            width="512"
            height="512"
            className="border-8 border-night rounded"
          />
          <div className="flex space-x-4">
            <UnderlinedLink href="/bort">Go to app</UnderlinedLink>
            <span>|</span>
            <UnderlinedLink href="/bort/about">Read about</UnderlinedLink>
          </div>
        </div>
      </div>
    </div>
  );
}
