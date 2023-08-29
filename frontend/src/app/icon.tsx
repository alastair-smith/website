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
          background: 'rgb(191 191 191)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          color: '#2D2E2E',
          fontFamily: mulish.className,
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
