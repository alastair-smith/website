import { type NextRequest, NextResponse } from 'next/server';

import { startActiveSpan, startTelemetry } from '@/telemetry';

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

  startTelemetry();

  return startActiveSpan(
    `${request.method} ${url.pathname}`,
    () => {
      const response = NextResponse.next();

      return response;
    },
    {
      attributes: {
        ...getRequestHeaderAttributes(request.headers),
      },
    }
  );
}

export const config = {
  unstable_allowDynamic: [
    '../../node_modules/.pnpm/@protobufjs+inquire@1.1.0/node_modules/@protobufjs/inquire/index.js', // Adjust this pattern as necessary
  ],
};
