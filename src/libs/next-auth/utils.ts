import UrlJoin from 'url-join';

/**
 * Standard implementation of the OAuth 2.0 refresh token flow.
 * ref: https://www.rfc-editor.org/rfc/rfc6749.html#section-1.5
 * @param issuer
 * @param path
 * @param clientId
 * @param clientSecret
 * @param refreshToken
 * @returns
 */
export async function oAuth2RefreshToken(
  issuer: string,
  path: string,
  clientId: string,
  clientSecret: string,
  refreshToken: string,
) {
  const response = await fetch(UrlJoin(issuer, path), {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });
  const tokensOrError = await response.json();

  if (!response.ok) throw tokensOrError;

  return tokensOrError as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };
}
