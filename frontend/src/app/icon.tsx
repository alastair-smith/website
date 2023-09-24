import { Mulish } from 'next/font/google';
import { ImageResponse } from 'next/server';

const mulish = Mulish({ subsets: ['latin'] });
export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'rgb(248, 244, 239)', // day
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          color: 'rgb(45, 46, 46)', // jet
          fontFamily: mulish.className, // TODO fix font
          borderRadius: '2px',
        }}
      >
        AL
      </div>
    ),
    {
      ...size,
    }
  );
}
