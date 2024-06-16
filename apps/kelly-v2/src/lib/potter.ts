import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import GifEncoder from 'gif-encoder';

import asyncExecute from './asyncExecute';

const GIF_DIMENSIONS = [480, 270];
const IMAGE_DIMENSIONS = [480, 270];
const TEXT_COLOR = '#110a05';
const TEXT_FONT = '14px LibreBaskerville';
const TEXT_POSITION = [210, -50];
const TEXT_ROTATION = 0.5;
const gifsicle = '/opt/lib/gifsicle';
const maxLines = 9;

registerFont('/opt/fonts/LibreBaskerville-Regular.otf', {
  family: 'LibreBaskerville',
});

function insertNewlines(text: string) {
  const maxLength = 20;

  let result = '';
  let currentLine = '';
  let lineCount = 0;

  const words = text.split(' ');

  for (const word of words) {
    if (lineCount >= maxLines) {
      break;
    }

    if (currentLine.length + word.length + 1 > maxLength) {
      if (currentLine.length > 0) {
        result += currentLine + '\n';
        lineCount++;
        currentLine = '';
        if (lineCount >= maxLines) {
          break;
        }
      }

      if (word.length > maxLength) {
        let part = word.slice(0, maxLength - 1);
        result += part + '-\n';
        lineCount++;
        currentLine = word.slice(maxLength - 1);
        if (lineCount >= maxLines) {
          break;
        }
      } else {
        currentLine = word;
      }
    } else {
      if (currentLine.length > 0) {
        currentLine += ' ';
      }
      currentLine += word;
    }
  }

  if (lineCount < maxLines && currentLine.length > 0) {
    result += currentLine;
  }

  return { result, lineCount };
}

const generateGif = async (text: string): Promise<string> => {
  const canvas = createCanvas(IMAGE_DIMENSIONS[0], IMAGE_DIMENSIONS[1]);
  const context = canvas.getContext('2d');

  context.font = TEXT_FONT;

  const image = await loadImage('./src/assets/potter/blank.jpg');
  context.drawImage(image, 0, 0);
  context.save();
  context.rotate(TEXT_ROTATION);
  context.fillStyle = TEXT_COLOR;

  const { result: linedText, lineCount } = insertNewlines(text);

  context.fillText(
    linedText,
    TEXT_POSITION[0],
    TEXT_POSITION[1] + (maxLines - lineCount) * 7
  );
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
          25
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
