'use server';

import { addBort as addBortService } from '@/services/bort';

export const addBort = async () => {
  'use server';

  try {
    const data = await addBortService();
    return { data, error: null };
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
