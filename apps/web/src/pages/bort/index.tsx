import { useEffect, useState } from 'react';

import Button from '@/components/Button/Button';
import UnderlinedLink from '@/components/UnderlinedLink/UnderlinedLink';
import { addBort, getBortCount } from '@/services/bort';

export default function Bort() {
  const [bortCount, setBortCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    getBortCount()
      .then(({ count }) => setBortCount(count))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Unknown error')
      );
  }, []);

  const clickHandler = () => {
    setBortCount((c) => c + 1);
    setIsPending(true);
    void addBort()
      .then(({ count }) => setBortCount(count))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Unknown error')
      )
      .finally(() => setIsPending(false));
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

      <UnderlinedLink href="/bort/about">Umm what is this?</UnderlinedLink>
    </div>
  );
}
