import {
  MAX_OAUTH_REDIRECT_URIS,
  normalizeRedirectUris,
  validateRedirectUri,
} from '@lobechat/utils/oauthApp';

/** The form edits redirect URIs as one-per-line text; the API takes a list. */
export const splitRedirectUris = (value?: string) =>
  normalizeRedirectUris((value ?? '').split('\n'));

export const joinRedirectUris = (uris?: string[] | null) => (uris ?? []).join('\n');

const ISSUE_MESSAGE_KEYS = {
  credentials: 'oauthApp.validation.redirectUri.credentials',
  fragment: 'oauthApp.validation.redirectUri.fragment',
  insecure: 'oauthApp.validation.redirectUri.insecure',
  malformed: 'oauthApp.validation.redirectUri.malformed',
  wildcard: 'oauthApp.validation.redirectUri.wildcard',
} as const;

/**
 * Validates the textarea contents against the same rules the server enforces.
 *
 * Returns the message key of the first problem found so the caller can localize
 * it, or `undefined` when every line is acceptable.
 */
export const validateRedirectUrisInput = (value?: string) => {
  const uris = splitRedirectUris(value);

  if (uris.length === 0) return 'oauthApp.validation.redirectUriRequired' as const;
  if (uris.length > MAX_OAUTH_REDIRECT_URIS)
    return 'oauthApp.validation.redirectUriTooMany' as const;

  for (const uri of uris) {
    const issue = validateRedirectUri(uri);
    if (issue) return ISSUE_MESSAGE_KEYS[issue];
  }

  return undefined;
};
