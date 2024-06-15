import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import GifEncoder from 'gif-encoder';

import asyncExecute from './asyncExecute';

const GIF_DIMENSIONS = [480, 270];
const IMAGE_DIMENSIONS = [480, 270];
const MAX_WIDTH = 580;
const TEXT_COLOR = '#110a05';
const TEXT_FONT = '14px LibreBaskerville';
const TEXT_POSITION = [210, -10];
const TEXT_ROTATION = 0.55;
const gifsicle = '/opt/lib/gifsicle';

registerFont('/opt/fonts/LibreBaskerville-Regular.otf', {
  family: 'LibreBaskerville',
});

const generateGif = async (text: string): Promise<string> => {
  const canvas = createCanvas(IMAGE_DIMENSIONS[0], IMAGE_DIMENSIONS[1]);
  const context = canvas.getContext('2d');

  context.font = TEXT_FONT;

  const image = await loadImage('./src/assets/potter/blank.jpg');
  context.drawImage(image, 0, 0);
  context.save();
  context.rotate(TEXT_ROTATION);
  context.fillStyle = TEXT_COLOR;

  while (context.measureText(text).width > MAX_WIDTH) {
    // text width is unpredictable but needs to be cropped
    text = text.substring(0, text.length - 1);
  }
  context.fillText(text, TEXT_POSITION[0], TEXT_POSITION[1]);
  context.restore();
  const completeGif: string = await new Promise((resolve, reject) => {
    context.drawImage(canvas, 0, 0, GIF_DIMENSIONS[0], GIF_DIMENSIONS[1]);

    const gif = new GifEncoder(...GIF_DIMENSIONS);
    const file = fs.createWriteStream('/tmp/single-frame.gif');
    file.on('error', (error: unknown) => reject(error));
    file.on('finish', async () => {
      // stitch gifs together
      const base64Gif = await asyncExecute(
        `${gifsicle} --lossy -d 15 --merge ./src/assets/potter/start.gif ${Array(
          15
        )
          .fill('/tmp/single-frame.gif')
          .join(' ')} ./src/assets/potter/end.gif | base64`
      );
      resolve(base64Gif);
    });
    const pixels = context.getImageData(
      0,
      0,
      GIF_DIMENSIONS[0],
      GIF_DIMENSIONS[1]
    ).data;

    gif.pipe(file);

    // Write out the image into memory
    gif.writeHeader();
    gif.addFrame(pixels);
    gif.finish();
  });
  return completeGif;
};

export default generateGif;
