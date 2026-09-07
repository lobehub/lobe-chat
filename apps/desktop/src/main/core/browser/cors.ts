import type { Session } from 'electron';

import { appendVercelCookie, setResponseHeader } from '@/utils/http-headers';

/** Preserve the desktop CORS bypass for requests that include credentials. */
export function setupCORSBypass(session: Session): void {
  const requestMap = new Map<number, { origin?: string; requestedHeaders?: string }>();

  session.webRequest.onBeforeSendHeaders((details, callback) => {
    const requestHeaders = { ...details.requestHeaders };

    const context: { origin?: string; requestedHeaders?: string } = {};

    // Electron preserves header casing, while HTTP header names are case-insensitive.
    for (const [name, value] of Object.entries(requestHeaders)) {
      if (name.toLowerCase() === 'origin') {
        context.origin = value;
        delete requestHeaders[name];
      } else if (name.toLowerCase() === 'access-control-request-headers') {
        context.requestedHeaders = value;
      }
    }
    requestMap.set(details.id, context);

    appendVercelCookie(requestHeaders);

    callback({ requestHeaders });
  });

  session.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = details.responseHeaders || {};
    const context = requestMap.get(details.id);
    const origin = context?.origin || '*';

    // Force set CORS headers (replace existing to avoid duplicates from case-insensitive keys)
    setResponseHeader(responseHeaders, 'Access-Control-Allow-Origin', origin);
    setResponseHeader(
      responseHeaders,
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    );
    // A wildcard is a literal header name for credentialed requests, so echo
    // the preflight's explicit list (including Content-Type and Authorization).
    setResponseHeader(
      responseHeaders,
      'Access-Control-Allow-Headers',
      context?.requestedHeaders || 'Content-Type, Authorization',
    );
    setResponseHeader(responseHeaders, 'Access-Control-Allow-Credentials', 'true');

    requestMap.delete(details.id);

    if (details.method === 'OPTIONS') {
      setResponseHeader(responseHeaders, 'Access-Control-Max-Age', '86400');
      callback({ responseHeaders, statusLine: 'HTTP/1.1 200 OK' });
      return;
    }

    callback({ responseHeaders });
  });

  session.webRequest.onErrorOccurred((details) => {
    requestMap.delete(details.id);
  });
}
