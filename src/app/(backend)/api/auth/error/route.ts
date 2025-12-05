import { NextResponse } from 'next/server';

/**
 * Explicit error endpoint to avoid platform-level redirects.
 * Returns a JSON payload with optional message and code query params.
 */
export const GET = (request: Request) => {
  const { searchParams } = new URL(request.url);

  const error = searchParams.get('error') ?? 'unknown_error';
  const message =
    searchParams.get('message') ??
    'Authentication error occurred. Please try again or contact support if the issue persists.';

  return NextResponse.json(
    {
      error,
      message,
    },
    { status: 400 },
  );
};
