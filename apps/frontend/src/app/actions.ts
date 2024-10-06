'use server';

import { addBort, getBortCount } from '@/services/bort';

export const runtime = 'edge';

export const addBortAction = async () => {
  try {
    const data = await addBort();
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

export const getBortCountAction = async () => {
  try {
    const data = await getBortCount();
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
