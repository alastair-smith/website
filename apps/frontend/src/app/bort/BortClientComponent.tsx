'use client';

import { useState, useTransition } from 'react';

import Button from '@/components/Button/Button';
import UnderlinedLink from '@/components/UnderlinedLink/UnderlinedLink';

import type { addBortAction, getBortCountAction } from '../actions';

export const BortClientComponent = ({
  initialBortCount,
  addBort,
}: {
  initialBortCount: Awaited<ReturnType<typeof getBortCountAction>>;
  addBort: typeof addBortAction;
}) => {
  const [bortCount, setBortCount] = useState(initialBortCount.data?.count ?? 0);
  const [error, setError] = useState(initialBortCount.error ?? '');
  const [isPending, startTransition] = useTransition();

  const errorHandler = (error: any) => {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    setError(errorMessage);
  };

  const clickHandler = () => {
    setBortCount(bortCount + 1);

    startTransition(async () => {
      const { error, data } = await addBort();

      if (error) errorHandler(error);
      else setBortCount(data.count);
    });
  };

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
          <span className="text-4xl">{bortCount}</span>
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
};
