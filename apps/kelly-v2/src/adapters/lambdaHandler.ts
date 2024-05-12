import type { Handler } from 'aws-lambda';

import kelly from '@/lib/kelly';

export const handler: Handler<unknown, string> = (event) => {
  return kelly('x');
};
