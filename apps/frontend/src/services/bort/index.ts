import z from 'zod';

import { startActiveSpan } from '@/telemetry';

export const API_URL =
  'https://s2bfkjbsfg.execute-api.eu-west-1.amazonaws.com/stage';

const responseSchema = z.object({
  count: z.number().int().positive(),
});

export type BortResponse = z.infer<typeof responseSchema>;

export const addBort = async (): Promise<BortResponse> =>
  await startActiveSpan('service:bort:addBort', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      cache: 'no-cache',
    });

    if (!response.ok) throw new Error('Failed to post Bort data');

    try {
      const validatedData = responseSchema.parse(await response.json());

      return validatedData;
    } catch (error) {
      let issues =
        error instanceof z.ZodError ? JSON.stringify(error.issues) : 'unknown';

      throw new Error(`Bort validation error: ${issues}.`, { cause: error });
    }
  });

export const getBortCount = async (): Promise<BortResponse> =>
  await startActiveSpan('service:bort:getBortCount', async () => {
    const response = await fetch(API_URL);

    if (!response.ok) throw new Error('Failed to fetch Bort data');

    try {
      const validatedData = responseSchema.parse(await response.json());

      return validatedData;
    } catch (error) {
      let issues =
        error instanceof z.ZodError ? JSON.stringify(error.issues) : 'unknown';

      throw new Error(`Bort validation error: ${issues}.`, { cause: error });
    }
  });
