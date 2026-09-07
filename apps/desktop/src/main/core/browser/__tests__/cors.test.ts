import type { Session } from 'electron';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setupCORSBypass } from '../cors';

vi.mock('@/env', () => ({ getDesktopEnv: () => ({}) }));

describe('desktop credentialed CORS', () => {
  const webRequest = {
    onBeforeSendHeaders: vi.fn(),
    onErrorOccurred: vi.fn(),
    onHeadersReceived: vi.fn(),
  };

  const send = (id: number, requestHeaders: Record<string, string>) => {
    const callback = vi.fn();
    webRequest.onBeforeSendHeaders.mock.calls[0][0](
      { id, requestHeaders, url: 'https://app.lobehub.com/api/auth/change-email' },
      callback,
    );
    return callback.mock.calls[0][0].requestHeaders;
  };

  const receive = (id: number, method = 'OPTIONS', responseHeaders = {}) => {
    const callback = vi.fn();
    webRequest.onHeadersReceived.mock.calls[0][0]({ id, method, responseHeaders }, callback);
    return callback.mock.calls[0][0];
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupCORSBypass({ webRequest } as unknown as Session);
  });

  it.each([
    ['Origin', 'Access-Control-Request-Headers'],
    ['origin', 'access-control-request-headers'],
    ['ORIGIN', 'ACCESS-CONTROL-REQUEST-HEADERS'],
  ])('allows the email-change preflight with %s header casing', (origin, headers) => {
    const outgoing = send(1, {
      [origin]: 'app://renderer',
      [headers]: 'content-type',
      'Access-Control-Request-Method': 'POST',
    });
    expect(outgoing).not.toHaveProperty(origin);
    expect(outgoing[headers]).toBe('content-type');

    const response = receive(1, 'OPTIONS', {
      'access-control-allow-headers': ['*'],
      'access-control-allow-origin': ['*'],
    });
    expect(response.statusLine).toBe('HTTP/1.1 200 OK');
    expect(response.responseHeaders).toMatchObject({
      'Access-Control-Allow-Credentials': ['true'],
      'Access-Control-Allow-Headers': ['content-type'],
      'Access-Control-Allow-Origin': ['app://renderer'],
    });
    expect(response.responseHeaders).not.toHaveProperty('access-control-allow-headers');
    expect(response.responseHeaders).not.toHaveProperty('access-control-allow-origin');
  });

  it('keeps concurrent preflight header lists separate', () => {
    send(1, {
      'Origin': 'app://renderer',
      'Access-Control-Request-Headers': 'authorization, content-type, x-custom-header',
    });
    send(2, {
      'Origin': 'http://localhost:9876',
      'Access-Control-Request-Headers': 'x-other-header',
    });
    expect(receive(2).responseHeaders['Access-Control-Allow-Headers']).toEqual(['x-other-header']);
    expect(receive(1).responseHeaders['Access-Control-Allow-Headers']).toEqual([
      'authorization, content-type, x-custom-header',
    ]);
  });

  it('preserves credentials and the origin for the actual POST without replacing its status', () => {
    const outgoing = send(1, {
      'Origin': 'app://renderer',
      'Content-Type': 'application/json',
      'Cookie': 'session=test',
    });
    expect(outgoing.Cookie).toBe('session=test');
    expect(outgoing['Content-Type']).toBe('application/json');
    const response = receive(1, 'POST');
    expect(response).not.toHaveProperty('statusLine');
    expect(response.responseHeaders['Access-Control-Allow-Origin']).toEqual(['app://renderer']);
    expect(response.responseHeaders['Access-Control-Allow-Credentials']).toEqual(['true']);
  });

  it.each(['response', 'error'])('clears request context after a %s', (completion) => {
    send(1, { 'Origin': 'app://renderer', 'Access-Control-Request-Headers': 'x-private-header' });
    if (completion === 'response') receive(1);
    else webRequest.onErrorOccurred.mock.calls[0][0]({ id: 1 });
    const response = receive(1);
    expect(response.responseHeaders['Access-Control-Allow-Headers']).toEqual([
      'Content-Type, Authorization',
    ]);
    expect(response.responseHeaders['Access-Control-Allow-Origin']).toEqual(['*']);
  });
});
