'use server';

import { z } from 'zod';

import { startActiveSpan } from '@/telemetry';

const bortSchema = z.object({
  count: z.number().int().positive(),
});

export const addBort = async () => {
  'use server';

  console.log('adding bort');

  try {
    return await startActiveSpan('bort', async () => {
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
    });
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
