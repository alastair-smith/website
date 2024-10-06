'use client';

import { useEffect, useState, useTransition } from 'react';

import { addBortAction, getBortCountAction } from '@/app/actions';
import Button from '@/components/Button/Button';
import UnderlinedLink from '@/components/UnderlinedLink/UnderlinedLink';

export default function Page() {
  const [bortCount, setBortCount] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const errorHandler = (error: any) => {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    setError(errorMessage);
  };

  const clickHandler = () => {
    setBortCount(bortCount + 1);

    startTransition(async () => {
      const { error, data } = await addBortAction();

      if (error) errorHandler(error);
      else setBortCount(data.count);
    });
  };

  useEffect(() => {
    const getBortCount = async () => {
      const { data, error } = await getBortCountAction();

      if (error) errorHandler(error);
      else setBortCount(data.count);

      setIsLoading(false);
    };

    getBortCount();
  }, []);

  return (
    <div className="max-w-reading mx-medium my-huge w-full flex-col flex">
      <h1 className="uppercase font-bold text-4xl mb-huge">Bort</h1>
      {error ? (
        <div className="flex flex-col items-center">
          <span>We need more Bort Licence Plates!</span>
          <span>Try refreshing to see if they&apos;ve been restocked</span>
          <span>(There was an error with the server)</span>
        </div>
      ) : (
        <div className="flex flex-col items-center mb-huge">
          <span>Number of Borts:</span>
          <span className="text-4xl">{isLoading ? '...' : bortCount}</span>
          <Button
            className="mt-large"
            disabled={isPending}
            onClick={clickHandler}
          >
            My son is also named Bort{isPending && '...'}
          </Button>
        </div>
      )}

      <UnderlinedLink
        href="/bort/about"
        className="focus:outline-none focus:ring-4 ring-violet-500 rounded px-small py-tiny self-start text-lg underline underline-offset-[6px] hover:underline-offset-2 ease-linear duration-100 hover:decoration-2"
      >
        Umm what is this?
      </UnderlinedLink>
    </div>
  );
}
