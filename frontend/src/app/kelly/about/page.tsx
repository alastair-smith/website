'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

import TextInput from '@/components/TextInput/TextInput';
import { Button } from '@/components/ui/Button';

export default function Page() {
  const [inputValue, setInputValue] = useState('');
  const [submittedValue, setSubmittedValue] = useState('');
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (inputValue !== submittedValue) {
      setIsLoading(true);
      setSubmittedValue(inputValue);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    // TODO swap to breadcrumbs?
    <div className="max-w-reading mx-medium my-huge w-full flex-col flex">
      <Link href="/kelly" className="flex items-center mb-medium">
        <svg
          className="rotate-180 mr-tiny"
          xmlns="http://www.w3.org/2000/svg"
          height="1em"
          viewBox="0 0 448 512"
        >
          <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
        </svg>
        <span>Kelly</span>
      </Link>

      <section className="mb-huge ease-in duration-300">
        <h1 className="uppercase font-bold text-4xl mb-huge">Kelly</h1>
        <p className="my-medium">
          Right so there&apos;s this song by Nelly and Kelly Rowland called
          Dilemma which is an absolute banger. But in the music video
          there&apos;s a weird scene where she checks her phone but it is
          displaying an excel spreadsheet with a message for Nelly on it. So I
          thought it would be fun to make a meme generator where you could
          change the text in her spreadsheet and then I got carried away and
          added gif functionality.
        </p>

        <p className="my-medium">
          Here is an interview where Mrs Rowland goes into more detail about the
          origins of the scene and why she&apos;s using microsoft excel on a
          phone to communicate with Nelly.
        </p>

        <div className="flex flex-col items-center my-large">
          <iframe
            src="https://www.youtube.com/embed/1MNvkFD5dyo?start=175&end=201"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full aspect-video focus-visible:outline-none"
          />
        </div>
      </section>
      <section>
        {/* <h2 className="font-bold text-2xl">How does it work?</h2>

        <p>I&apos;m going to go into a bit of technical detail here.</p> */}

        <div className="flex flex-col items-center mt-huge">
          <iframe
            className="w-[20rem] h-[5rem] focus-visible:outline-none"
            src="https://open.spotify.com/embed/track/0ARK753YaiJbpLUk7z5yIM?utm_source=generator&theme=0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
