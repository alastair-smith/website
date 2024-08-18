import { type NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Log request details
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Request Headers:', JSON.stringify(req.headers));

  // Proceed with the response
  const response = NextResponse.next();

  // Optionally, log response details here
  return response;
}
