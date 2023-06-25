'use server';

import { z } from 'zod';

export const addBort = async () => {
  'use server';

  const res = await fetch(
    'https://s2bfkjbsfg.execute-api.eu-west-1.amazonaws.com/stage',
    { method: 'POST', cache: 'no-cache' }
  );

  if (!res.ok) throw new Error('Failed to post Bort data');

  const json = await res.json();

  const validatedData = z
    .object({
      count: z.number().int().positive(),
    })
    .parse(json);

  return validatedData;
};
