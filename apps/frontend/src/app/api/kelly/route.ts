import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { search: query } = new URL(request.url);
  const res = await fetch(
    `https://csdmeeplo0.execute-api.eu-west-1.amazonaws.com/${query}`
  );

  return res.headers.get('content-type') === 'image/png' ||
    res.headers.get('content-type') === 'image/gif'
    ? res
    : redirect('/kelly');
}
