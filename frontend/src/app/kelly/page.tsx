'use client';

import { FormEvent, useState } from 'react';

import Button from '@/components/Button/Button';
import TextInput from '@/components/TextInput/TextInput';

const Gif = ({ text }: { text: string }) => {
  const url = `https://alsmith.dev/kelly/api?text=${text}&gif=1`;

  const copyUrl = () => navigator.clipboard.writeText(url);

  return (
    <div className="flex flex-col items-center">
      <img src={url} className="max-w-[480px]" alt="kelly" />
      <Button onClick={copyUrl}>Copy URL</Button>
    </div>
  );
};

const MoreInfo = () => (
  <section className="mb-gigantic ease-in duration-300">
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

    <div className="flex flex-col items-center">
      <iframe
        className="w-full focus-visible:outline-none max-w-form"
        src="https://open.spotify.com/embed/track/0ARK753YaiJbpLUk7z5yIM?utm_source=generator&theme=0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </div>
  </section>
);

export default function Page() {
  const [inputValue, setInputValue] = useState('');
  const [submittedValue, setSubmittedValue] = useState('');
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Add your logic for form submission here
    // For example, you can send the input value to an API or perform some other action
    console.log('Form submitted with value:', inputValue);
    setSubmittedValue(inputValue);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  return (
    <div className="max-w-reading mx-medium w-full flex-col flex">
      <h1 className="uppercase font-bold text-4xl mb-huge mt-huge">Kelly</h1>
      <form
        className="max-w-form mb-huge flex flex-col"
        onSubmit={handleSubmit}
      >
        <TextInput
          className="mb-small"
          value={inputValue}
          onChange={handleChange}
        />
        <Button className="self-end">Create Gif</Button>
      </form>

      {submittedValue && <Gif text={submittedValue} />}

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
