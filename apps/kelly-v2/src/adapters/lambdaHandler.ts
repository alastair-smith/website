import type { Handler } from 'aws-lambda';
import { z } from 'zod';

import kelly from '@/lib/kelly';

const schema = z.object({
  text: z.string(),
});

const validateInput = (event: unknown): Parameters<typeof kelly> => {
  const parsed = schema.parse(event);

  return [parsed.text];
};

export const handler: Handler<unknown, string> = async (event) => {
  const input = validateInput(event);

  const result = await kelly(...input);

  return result;
};
