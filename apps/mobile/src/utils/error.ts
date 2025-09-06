// 根据错误对象/消息推断登录错误码，便于 i18n
export const getLoginErrorKey = (err: unknown): string => {
  // 如果服务端或上层抛出了结构化错误码
  const maybe: any = err as any;
  const code = typeof maybe?.code === 'string' ? maybe.code : undefined;
  if (code) {
    switch (code) {
      case 'access_denied': {
        return 'login.accessDenied';
      }
      case 'invalid_request': {
        return 'login.invalidRequest';
      }
      case 'unsupported_response_type': {
        return 'login.unsupportedResponseType';
      }
      case 'server_error': {
        return 'login.serverError';
      }
      case 'temporarily_unavailable': {
        return 'login.temporarilyUnavailable';
      }
      case 'invalid_state': {
        return 'login.invalidState';
      }
      case 'network_error': {
        return 'login.networkError';
      }
      case 'auth_cancelled': {
        return 'login.cancelled';
      }
      case 'invalid_grant': {
        return 'login.invalidGrant';
      }
      default: {
        break;
      }
    }
  }

  const message = maybe instanceof Error ? maybe.message : String(maybe ?? '');
  const msg = (message || '').toLowerCase();

  if (msg.includes('cancel')) return 'login.cancelled';

  // OIDC 回调错误：Authorization error: access_denied
  const authErrMatch = message.match(/authorization error:\s*([^\s:]+)/i);
  if (authErrMatch?.[1]) {
    const oidc = authErrMatch[1];
    switch (oidc) {
      case 'access_denied': {
        return 'login.accessDenied';
      }
      case 'invalid_request': {
        return 'login.invalidRequest';
      }
      case 'unsupported_response_type': {
        return 'login.unsupportedResponseType';
      }
      case 'server_error': {
        return 'login.serverError';
      }
      case 'temporarily_unavailable': {
        return 'login.temporarilyUnavailable';
      }
      default: {
        return 'login.serverError';
      }
    }
  }

  if (
    msg.includes('missing authorization code') ||
    msg.includes('missing authorization') ||
    msg.includes('missing code') ||
    msg.includes('missing state')
  )
    return 'login.missingCodeOrState';

  if (msg.includes('missing pkce')) return 'login.missingPkce';

  if (msg.includes('invalid state')) return 'login.invalidState';

  if (msg.includes('token exchange failed')) {
    if (msg.includes('invalid_grant')) return 'login.invalidGrant';
    return 'login.tokenExchangeFailed';
  }

  if (msg.includes('non-json response')) return 'login.tokenEndpointNonJson';

  if (msg.includes('no id token')) return 'login.noIdToken';
  if (msg.includes('failed to extract user info')) return 'login.invalidIdToken';

  if (msg.includes('network')) return 'login.networkError';

  return 'login.unknown';
};
