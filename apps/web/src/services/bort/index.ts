import z from 'zod';

export const API_URL =
  'https://s2bfkjbsfg.execute-api.eu-west-1.amazonaws.com/stage';

const responseSchema = z.object({
  count: z.number().int().positive(),
});

export type BortResponse = z.infer<typeof responseSchema>;

export const addBort = async (): Promise<BortResponse> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    cache: 'no-store',
  });

  if (!response.ok) throw new Error('Failed to post Bort data');

  try {
    return responseSchema.parse(await response.json());
  } catch (error) {
    const issues =
      error instanceof z.ZodError ? JSON.stringify(error.issues) : 'unknown';
    throw new Error(`Bort validation error: ${issues}.`, { cause: error });
  }
};

export const getBortCount = async (): Promise<BortResponse> => {
  const response = await fetch(API_URL, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) throw new Error('Failed to fetch Bort data');

  try {
    return responseSchema.parse(await response.json());
  } catch (error) {
    const issues =
      error instanceof z.ZodError ? JSON.stringify(error.issues) : 'unknown';
    throw new Error(`Bort validation error: ${issues}.`, { cause: error });
  }
};
