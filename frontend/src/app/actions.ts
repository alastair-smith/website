'use server';

import { z } from 'zod';

const bortSchema = z.object({
  count: z.number().int().positive(),
});

export const addBort = async () => {
  'use server';

  try {
    const res = await fetch(
      'https://s2bfkjbsfg.execute-api.eu-west-1.amazonaws.com/stage',
      {
        method: 'POST',
        cache: 'no-cache',
      }
    );

    if (!res.ok) throw new Error('Failed to post Bort data');

    const json = await res.json();

    const validatedData = bortSchema.parse(json);

    return { data: validatedData, error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error
          : new Error('Unknown error fetching bort data'),
      data: null,
    };
  }
};
