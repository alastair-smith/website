import {
  ATTR_HTTP_REQUEST_HEADER,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_HEADER,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_NETWORK_PROTOCOL_NAME,
} from '@opentelemetry/semantic-conventions/incubating';
import { type NextRequest, NextResponse } from 'next/server';

import { startActiveSpan, startTelemetry } from '@/telemetry';

const getRequestHeaderAttributes = (
  requestHeaders: NextRequest['headers']
): Record<string, string> => {
  return Object.fromEntries(
    Array.from(requestHeaders.entries())
      .filter(([headerName]) => headerName.toLowerCase() !== 'cookies')
      .map(([headerName, headerValue]) => [
        ATTR_HTTP_REQUEST_HEADER(headerName),
        headerValue,
      ])
  );
};

const getResponseHeaderAttributes = (
  responseHeaders: NextResponse['headers']
): Record<string, string> => {
  return Object.fromEntries(
    Array.from(responseHeaders.entries())
      // TODO swap to safelist of headers to track, there's lots of noise that we can remove
      .filter(([headerName]) => headerName.toLowerCase() !== 'set-cookie')
      .map(([headerName, headerValue]) => [
        ATTR_HTTP_RESPONSE_HEADER(headerName),
        headerValue,
      ])
  );
};

export function middleware(request: NextRequest) {
  startTelemetry();

  const url = new URL(request.url);

  return startActiveSpan(
    // standard convention
    `${request.method} ${url.pathname}`,
    (span) => {
      const response = NextResponse.next();

      // response span attributes
      span.setAttributes({
        ...getResponseHeaderAttributes(response.headers),
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: response.status,
      });

      span.end();

      return response;
    },
    {
      // request span attributes
      attributes: {
        ...getRequestHeaderAttributes(request.headers),
        [ATTR_HTTP_REQUEST_METHOD]: request.method,
        [ATTR_HTTP_ROUTE]: url.pathname,
        [ATTR_NETWORK_PROTOCOL_NAME]: url.protocol,
      },
    }
  );
}
