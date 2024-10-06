import { addBortAction, getBortCountAction } from '@/app/actions';

import { BortClientComponent } from './BortClientComponent';

export const runtime = 'edge';

export default async function Page() {
  const initialBortCount = await getBortCountAction();

  return (
    <BortClientComponent
      initialBortCount={initialBortCount}
      addBort={addBortAction}
    />
  );
}
