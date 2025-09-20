import debug from 'debug';

const log = debug('lobe-oidc:validateRedirectHost');

/**
 * Validate if redirect host is in the allowed whitelist
 * Prevent Open Redirect attacks
 */
export const validateRedirectHost = (targetHost: string): boolean => {
  if (!targetHost || targetHost === 'null') {
    log('Invalid target host: %s', targetHost);
    return false;
  }

  // Get configured APP_URL as base domain
  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    log('Warning: APP_URL not configured, rejecting redirect to: %s', targetHost);
    return false;
  }

  try {
    const appUrlObj = new URL(appUrl);
    const appHost = appUrlObj.host;

    log('Validating target host: %s against app host: %s', targetHost, appHost);

    // Exact match
    if (targetHost === appHost) {
      log('Host validation passed: exact match');
      return true;
    }

    // Allow localhost and local addresses (development environment)
    const isLocalhost =
      targetHost === 'localhost' ||
      targetHost.startsWith('localhost:') ||
      targetHost === '127.0.0.1' ||
      targetHost.startsWith('127.0.0.1:') ||
      targetHost === '0.0.0.0' ||
      targetHost.startsWith('0.0.0.0:');

    if (
      isLocalhost &&
      (appHost.includes('localhost') ||
        appHost.includes('127.0.0.1') ||
        appHost.includes('0.0.0.0'))
    ) {
      log('Host validation passed: localhost environment');
      return true;
    }

    // Check if it's a subdomain of the configured domain
    const appDomain = appHost.split(':')[0]; // Remove port number
    const targetDomain = targetHost.split(':')[0]; // Remove port number

    if (targetDomain.endsWith('.' + appDomain)) {
      log('Host validation passed: subdomain of %s', appDomain);
      return true;
    }

    console.error('Host validation failed: %s is not allowed', targetHost);
    return false;
  } catch (error) {
    console.error('Error parsing APP_URL %s: %O', appUrl, error);
    return false;
  }
};
