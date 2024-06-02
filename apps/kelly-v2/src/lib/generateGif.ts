import { createCanvas, loadImage, registerFont } from 'canvas';
import { exec } from 'child_process';
import GifEncoder from 'gif-encoder';

const GIF_DIMENSIONS = [480, 360];
const IMAGE_DIMENSIONS = [968, 681];
const INCREASED_MAX_BUFFER = 1024 * 1024 * 5;
const MAX_WIDTH = 580;
const TEXT_COLOR = '#0049af';
const TEXT_FONT = '28px LibreBaskerville';
const TEXT_POSITION = [320, -110];
const TEXT_ROTATION = 0.6;

registerFont('/opt/fonts/LibreBaskerville-Regular.otf', {
  family: 'LibreBaskerville',
});

const generateGif = async (text: string): Promise<string> => {
  const canvas = createCanvas(IMAGE_DIMENSIONS[0], IMAGE_DIMENSIONS[1]);
  const context = canvas.getContext('2d');

  context.font = TEXT_FONT;

  const image = await loadImage('./base-image2.jpg');
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
    const file = require('fs').createWriteStream('/tmp/img.gif');
    file.on('error', (error: unknown) => reject(error));
    file.on('finish', () => {
      // add delay to middle frame
      exec(
        '/opt/lib/gifsicle -d 200 /tmp/img.gif -o /tmp/del.gif',
        (error, stdout, stderr) =>
          error
            ? reject(error)
            : exec(
                '/opt/lib/gifsicle --colors 256 --merge kelly1del.gif /tmp/del.gif kelly2del.gif | base64',
                { maxBuffer: INCREASED_MAX_BUFFER },
                (error2, stdout2, stderr2) =>
                  error2 ? reject(error2) : resolve(stdout2)
              )
      );
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
