'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';

import Button from '@/components/Button/Button';
import TextInput from '@/components/TextInput/TextInput';

const Gif = ({ text }: { text: string }) => {
  const url = `https://alsmith.dev/kelly/api?text=${text}&gif=1`;

  const copyUrl = () => navigator.clipboard.writeText(url);

  return (
    <div>
      <img src={url} alt="kelly" />
      <button onClick={copyUrl}>Copy URL</button>
    </div>
  );
};

export default function Page() {
  const [inputValue, setInputValue] = useState('');
  const [submittedValue, setSubmittedValue] = useState('');

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
    <>
      <h1>Kelly</h1>
      <form onSubmit={handleSubmit}>
        <TextInput value={inputValue} onChange={handleChange} />
        <Button>Submit</Button>
      </form>

      {submittedValue && <Gif text={submittedValue} />}

      <h2>Umm, what is this?</h2>
      <p>
        Right so there&apos;s this song by Nelly and Kelly Rowland called
        Dilemma which is an absolute banger. But in the music video there&apos;s
        a weird scene where she checks her phone for a message but it looks like
        an excel spreadsheet with her message on it. So I thought it would be
        fun to make a meme gnerator whee you could change the text in her
        spreadsheet and then things just snowballed and I added gif
        functionality.
      </p>
    </>
  );
}
