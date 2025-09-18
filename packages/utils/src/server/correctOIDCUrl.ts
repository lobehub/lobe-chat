import debug from 'debug';
import { NextRequest } from 'next/server';

import { validateRedirectHost } from './validateRedirectHost';

const log = debug('lobe-oidc:correctOIDCUrl');

/**
 * Fix OIDC redirect URL issues in proxy environments
 * @param req - Next.js request object
 * @param url - URL object to fix
 * @returns Fixed URL object
 */
export const correctOIDCUrl = (req: NextRequest, url: URL): URL => {
  const requestHost = req.headers.get('host');
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto =
    req.headers.get('x-forwarded-proto') || req.headers.get('x-forwarded-protocol');

  log('Input URL: %s', url.toString());
  log(
    'Request headers - host: %s, x-forwarded-host: %s, x-forwarded-proto: %s',
    requestHost,
    forwardedHost,
    forwardedProto,
  );

  // Determine actual hostname and protocol with fallback values
  const actualHost = forwardedHost || requestHost;
  const actualProto = forwardedProto || (url.protocol === 'https:' ? 'https' : 'http');

  // If unable to determine valid hostname, return original URL
  if (!actualHost || actualHost === 'null') {
    log('Warning: Cannot determine valid host, returning original URL');
    return url;
  }

  // Validate target host for security, prevent Open Redirect attacks
  if (!validateRedirectHost(actualHost)) {
    log('Warning: Target host %s failed validation, returning original URL', actualHost);
    return url;
  }

  // Correct URL if it points to localhost or hostname doesn't match actual request host
  const needsCorrection =
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname === '0.0.0.0' ||
    url.hostname !== actualHost;

  if (needsCorrection) {
    log('URL needs correction. Original hostname: %s, correcting to: %s', url.hostname, actualHost);

    try {
      const correctedUrl = new URL(url.toString());
      correctedUrl.protocol = actualProto + ':';
      correctedUrl.host = actualHost;

      log('Corrected URL: %s', correctedUrl.toString());
      return correctedUrl;
    } catch (error) {
      log('Error creating corrected URL, returning original: %O', error);
      return url;
    }
  }

  log('URL does not need correction, returning original: %s', url.toString());
  return url;
};
