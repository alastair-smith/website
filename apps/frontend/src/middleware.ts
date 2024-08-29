import { type NextRequest, NextResponse } from 'next/server';

import { startActiveSpan } from '@/telemetry';

const getRequestHeaderAttributes = (
  requestHeaders: NextRequest['headers']
): Record<`request.header.${string}`, string> => {
  return Object.fromEntries(
    Array.from(requestHeaders.entries())
      .filter(([headerName]) => headerName !== 'cookies')
      .map(([headerName, headerValue]) => [
        `request.header.${headerName}`,
        headerValue,
      ])
  );
};

export function middleware(request: NextRequest) {
  const url = new URL(request.url);

  console.log('req', url.pathname);

  return startActiveSpan(
    `${request.method} ${url.pathname}`,
    (span) => {
      const response = NextResponse.next();

      span.end();
      return response;
    },
    {
      attributes: {
        ...getRequestHeaderAttributes(request.headers),
      },
    }
  );
}
