'use client';

import { FormEvent, useState } from 'react';

import Button from '@/components/Button/Button';
import TextInput from '@/components/TextInput/TextInput';

const getUrl = (text: string) =>
  text ? `https://alsmith.dev/kelly/api?text=${text}&gif=1` : '';

const MoreInfo = () => (
  <section className="mb-huge ease-in duration-300">
    <h2 className="font-bold text-2xl">Umm, what is this?</h2>
    <p className="my-medium">
      Right so there&apos;s this song by Nelly and Kelly Rowland called Dilemma
      which is an absolute banger. But in the music video there&apos;s a weird
      scene where she checks her phone but it is displaying an excel spreadsheet
      with a message for Nelly on it. So I thought it would be fun to make a
      meme generator where you could change the text in her spreadsheet and then
      I got carried away and added gif functionality.
    </p>

    <p className="my-medium">
      Here is an interview where Mrs Rowland goes into more detail about the
      origins of the scene and why she&apos;s using microsoft excel on a phone
      to communicate with Nelly.
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

    <h2 className="font-bold text-2xl">How does it work?</h2>

    <p>I&apos;m going to go into a bit of technical detail here.</p>

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
);

const Cog = ({ className }: { className: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    height="7rem"
    viewBox="0 0 512 512"
  >
    <path
      fill="white"
      d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"
    />
  </svg>
);

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
    <div className="max-w-reading mx-medium my-huge w-full flex-col flex">
      <h1 className="uppercase font-bold text-4xl mb-huge">Kelly</h1>
      <form
        className="max-w-form mb-huge flex flex-col"
        onSubmit={handleSubmit}
      >
        <TextInput
          className="mb-small"
          value={inputValue}
          onChange={handleChange}
        />
        <div className="self-end">
          <Button
            className="mr-small"
            onClick={() =>
              window.navigator.clipboard.writeText(getUrl(inputValue))
            }
          >
            Copy URL
          </Button>
          <Button>Show Gif</Button>
        </div>
      </form>

      <div className="flex flex-col items-center mb-huge">
        <div className="max-w-[480px] w-full aspect-[4/3] bg-[url('/kelly-placeholder.jpg')] bg-contain flex justify-center items-center">
          {submittedValue && (
            <img
              src={getUrl(submittedValue)}
              className="max-w-[480px] w-full"
              alt="kelly"
              onLoad={handleImageLoad}
            />
          )}
          {isLoading && (
            <div className="flex self-center absolute">
              <Cog className="animate-spin-slow mt-[1.75rem] mr-[-0.825rem]" />
              <Cog className="animate-reverse-spin-slow" />
            </div>
          )}
        </div>
      </div>

      {showMoreInfo ? (
        <MoreInfo />
      ) : (
        <Button className="self-start" onClick={() => setShowMoreInfo(true)}>
          Umm what is this?
        </Button>
      )}
    </div>
  );
}
