import fsPromises from 'fs/promises';

import asyncExecute from '@/lib/asyncExecute';
import generateGif from '@/lib/generateGif';

const base64GifPath = 'example.gif.tmp';
const outputGifPath = 'example.gif';

export const handler = async (): Promise<void> => {
  const gifData = await generateGif('hello world');

  await fsPromises.writeFile(base64GifPath, gifData);

  await asyncExecute(`base64 -d ${base64GifPath} > ${outputGifPath}`);

  console.log(`GIF created at ${outputGifPath}`);
};
