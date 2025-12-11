// Route prefixes that should be proxied to the remote server.
export const REMOTE_REQUEST_ROUTE_PREFIXES = [
  '/trpc',
  '/api',
  '/webapi',
  '/f',
  '/market',
  '/middleware',
];

// Route prefixes that should be excluded from proxying (kept on local base).
export const REMOTE_REQUEST_EXCLUDE_PREFIXES = ['/oidc'];


