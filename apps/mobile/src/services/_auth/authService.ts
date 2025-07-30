import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { jwtDecode } from 'jwt-decode';
import { TokenStorage } from './tokenStorage';
import { PKCEUtils } from './pkce';
import type { AuthConfig, AuthService, Token, User, PKCE } from '@/types/user';
import { authLogger } from '@/utils/logger';
import { AUTH_ENDPOINTS } from '@/config/auth';

// 为 Web 浏览器配置预热
WebBrowser.maybeCompleteAuthSession();

export class OAuthService implements AuthService {
  private config: AuthConfig;
  private currentPKCE: PKCE | null = null;

  constructor(config: AuthConfig) {
    this.config = config;
    authLogger.info('OAuthService initialized', config);
  }

  /**
   * 获取重定向 URI
   */
  private getRedirectUri(): string {
    const redirectUri = AuthSession.makeRedirectUri({
      path: 'auth/callback',
      scheme: 'com.lobehub.app',
    });
    authLogger.info('Generated redirect URI', redirectUri);
    return redirectUri;
  }

  /**
   * 从 JWT ID token 中提取用户信息
   */
  private extractUserInfoFromToken(idToken: string): any | null {
    try {
      const payload = jwtDecode(idToken) as any;
      if (!payload) {
        return null;
      }

      // 提取标准 OIDC claims
      return {
        address: payload.address,
        aud: payload.aud, // Audience
        auth_time: payload.auth_time, // Authentication time
        birthdate: payload.birthdate,
        email: payload.email,
        email_verified: payload.email_verified,
        exp: payload.exp, // Expiration time
        family_name: payload.family_name,
        gender: payload.gender,
        given_name: payload.given_name,
        iat: payload.iat, // Issued at
        iss: payload.iss, // Issuer
        locale: payload.locale,
        middle_name: payload.middle_name,
        name: payload.name,
        nickname: payload.nickname,
        nonce: payload.nonce,
        phone_number: payload.phone_number,
        phone_number_verified: payload.phone_number_verified,
        picture: payload.picture,
        preferred_username: payload.preferred_username,
        profile: payload.profile,
        sub: payload.sub, // Subject (user ID)
        updated_at: payload.updated_at,
        website: payload.website,
        zoneinfo: payload.zoneinfo,
        // Any custom claims will also be included
        ...payload,
      };
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  }

  /**
   * 启动登录流程
   */
  async login(): Promise<void> {
    authLogger.info('Starting login flow');

    try {
      // 生成 PKCE 参数
      authLogger.info('Generating PKCE parameters');
      this.currentPKCE = await PKCEUtils.generatePKCEParameters();
      authLogger.info('PKCE parameters generated', {
        codeChallenge: this.currentPKCE.codeChallenge,
        state: this.currentPKCE.state,
      });

      // 构建授权 URL
      const authUrl = PKCEUtils.buildAuthorizationUrl(
        this.config.issuer,
        this.config.clientId,
        this.getRedirectUri(),
        this.config.scopes,
        this.currentPKCE,
        this.config.additionalParameters,
      );
      authLogger.info('Authorization URL built', authUrl);

      // 启动授权会话
      authLogger.info('Opening authorization session');
      const result = await WebBrowser.openAuthSessionAsync(authUrl, this.getRedirectUri());
      authLogger.info('Authorization session result', result);

      if (result.type === 'success') {
        authLogger.info('Authorization successful, handling callback');
        await this.handleAuthCallback(result.url);
      } else if (result.type === 'cancel') {
        authLogger.warn('Authorization was cancelled by user');
        throw new Error('Authorization was cancelled');
      } else {
        authLogger.error('Authorization failed', result);
        throw new Error('Authorization failed');
      }
    } catch (error) {
      authLogger.error('Login failed', error);
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * 处理授权回调
   */
  private async handleAuthCallback(url: string): Promise<void> {
    authLogger.info('Handling auth callback', url);

    try {
      const { code, state, error } = PKCEUtils.parseCallbackUrl(url);
      authLogger.info('Parsed callback URL', {
        code: code ? '[PRESENT]' : '[MISSING]',
        error,
        state,
      });

      if (error) {
        authLogger.error('Authorization error from callback', error);
        throw new Error(`Authorization error: ${error}`);
      }

      if (!code || !state) {
        authLogger.error('Missing authorization code or state', {
          hasCode: !!code,
          hasState: !!state,
        });
        throw new Error('Missing authorization code or state');
      }

      if (!this.currentPKCE) {
        authLogger.error('Missing PKCE parameters');
        throw new Error('Missing PKCE parameters');
      }

      // 验证 state 参数
      authLogger.info('Verifying state parameter');
      if (!PKCEUtils.verifyState(state, this.currentPKCE.state)) {
        authLogger.error('Invalid state parameter', {
          expected: this.currentPKCE.state,
          received: state,
        });
        throw new Error('Invalid state parameter');
      }
      authLogger.info('State parameter verified successfully');

      // 交换授权码获取令牌
      authLogger.info('Exchanging authorization code for token');
      const token = await this.exchangeCodeForToken(code, this.currentPKCE.codeVerifier);

      // 存储令牌
      authLogger.info('Storing token');
      await TokenStorage.storeToken(token);

      // 获取用户信息
      authLogger.info('Fetching user information');
      const user = await this.getUserInfo();
      await TokenStorage.storeUserData(user);

      // 清除 PKCE 参数
      this.currentPKCE = null;
      authLogger.info('Auth callback handled successfully');
    } catch (error) {
      authLogger.error('Failed to handle auth callback', error);
      console.error('Failed to handle auth callback:', error);
      throw error;
    }
  }

  /**
   * 交换授权码获取令牌
   */
  private async exchangeCodeForToken(code: string, codeVerifier: string): Promise<Token> {
    authLogger.info('Starting token exchange');

    try {
      const tokenEndpoint = `${this.config.issuer}${AUTH_ENDPOINTS.TOKEN}`;
      authLogger.info('Token endpoint', tokenEndpoint);

      const requestBody = {
        client_id: this.config.clientId,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: this.getRedirectUri(),
      };
      authLogger.info('Token request body', {
        ...requestBody,
        code: '[REDACTED]',
        code_verifier: '[REDACTED]',
      });

      const response = await fetch(tokenEndpoint, {
        body: new URLSearchParams(requestBody).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      });

      authLogger.info('Token response status', {
        status: response.status,
        statusText: response.statusText,
      });

      // Log response headers and content type for debugging
      const contentType = response.headers.get('content-type');
      authLogger.info('Token response headers', {
        contentType,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Get response text first to log it before parsing
      const responseText = await response.text();
      authLogger.info('Token response body', {
        body: responseText.slice(0, 500), // Log first 500 chars
        fullLength: responseText.length,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
          authLogger.error('Token exchange failed', errorData);
          throw new Error(
            `Token exchange failed: ${errorData.error_description || errorData.error}`,
          );
        } catch (parseError) {
          authLogger.error('Failed to parse error response as JSON', {
            parseError: parseError instanceof Error ? parseError.message : String(parseError),
            responseText: responseText.slice(0, 1000),
          });
          throw new Error(
            `Token exchange failed with non-JSON response: ${response.status} ${response.statusText}`,
          );
        }
      }

      let tokenData;
      try {
        tokenData = JSON.parse(responseText);
      } catch (parseError) {
        authLogger.error('Failed to parse success response as JSON', {
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
          responseText: responseText.slice(0, 1000),
        });
        throw new Error(
          `Token endpoint returned non-JSON response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        );
      }
      authLogger.info('Token response received', {
        expiresIn: tokenData.expires_in,
        hasAccessToken: !!tokenData.access_token,
        hasIdToken: !!tokenData.id_token,
        hasRefreshToken: !!tokenData.refresh_token,
        refreshExpiresIn: tokenData.refresh_expires_in,
        scope: tokenData.scope,
        tokenType: tokenData.token_type,
      });

      // 计算令牌过期时间
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + (tokenData.expires_in || 3600);
      const refreshExpiresAt = now + (tokenData.refresh_expires_in || 2_592_000); // 30天

      const token: Token = {
        accessToken: tokenData.access_token,
        expiresAt,
        idToken: tokenData.id_token,
        refreshExpiresAt,
        refreshToken: tokenData.refresh_token,
        scope: tokenData.scope,
        tokenType: tokenData.token_type || 'Bearer',
      };

      authLogger.info('Token object created', {
        expiresAt: new Date(token.expiresAt * 1000).toISOString(),
        refreshExpiresAt: new Date(token.refreshExpiresAt * 1000).toISOString(),
        scope: token.scope,
        tokenType: token.tokenType,
      });

      return token;
    } catch (error) {
      authLogger.error('Token exchange failed', error);
      console.error('Token exchange failed:', error);
      throw error;
    }
  }

  /**
   * 刷新令牌
   */
  async refreshToken(): Promise<Token> {
    authLogger.info('Starting token refresh');

    try {
      const currentToken = await TokenStorage.getToken();
      if (!currentToken?.refreshToken) {
        authLogger.error('No refresh token available');
        throw new Error('No refresh token available');
      }

      authLogger.info('Current token found', {
        accessTokenExpiry: new Date(currentToken.expiresAt * 1000).toISOString(),
        hasAccessToken: !!currentToken.accessToken,
        hasRefreshToken: !!currentToken.refreshToken,
        refreshTokenExpiry: new Date(currentToken.refreshExpiresAt * 1000).toISOString(),
      });

      const tokenEndpoint = `${this.config.issuer}${AUTH_ENDPOINTS.TOKEN}`;
      authLogger.info('Refresh token endpoint', tokenEndpoint);

      const response = await fetch(tokenEndpoint, {
        body: new URLSearchParams({
          client_id: this.config.clientId,
          grant_type: 'refresh_token',
          refresh_token: currentToken.refreshToken,
        }).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      });

      authLogger.info('Refresh token response status', {
        status: response.status,
        statusText: response.statusText,
      });

      // Log response headers and content type for debugging
      const contentType = response.headers.get('content-type');
      authLogger.info('Refresh token response headers', {
        contentType,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Get response text first to log it before parsing
      const responseText = await response.text();
      authLogger.info('Refresh token response body', {
        body: responseText.slice(0, 500), // Log first 500 chars
        fullLength: responseText.length,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
          authLogger.error('Token refresh failed', errorData);
          throw new Error(
            `Token refresh failed: ${errorData.error_description || errorData.error}`,
          );
        } catch (parseError) {
          authLogger.error('Failed to parse refresh error response as JSON', {
            parseError: parseError instanceof Error ? parseError.message : String(parseError),
            responseText: responseText.slice(0, 1000),
          });
          throw new Error(
            `Token refresh failed with non-JSON response: ${response.status} ${response.statusText}`,
          );
        }
      }

      let tokenData;
      try {
        tokenData = JSON.parse(responseText);
      } catch (parseError) {
        authLogger.error('Failed to parse refresh success response as JSON', {
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
          responseText: responseText.slice(0, 1000),
        });
        throw new Error(
          `Token refresh endpoint returned non-JSON response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        );
      }
      authLogger.info('Refresh token response received', {
        expiresIn: tokenData.expires_in,
        hasAccessToken: !!tokenData.access_token,
        hasIdToken: !!tokenData.id_token,
        hasNewRefreshToken: !!tokenData.refresh_token,
        refreshExpiresIn: tokenData.refresh_expires_in,
        scope: tokenData.scope,
        tokenType: tokenData.token_type,
      });

      // 计算令牌过期时间
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + (tokenData.expires_in || 3600);
      const refreshExpiresAt = now + (tokenData.refresh_expires_in || 2_592_000);

      const newToken: Token = {
        accessToken: tokenData.access_token,
        expiresAt,
        idToken: tokenData.id_token,
        refreshExpiresAt,
        refreshToken: tokenData.refresh_token || currentToken.refreshToken,
        scope: tokenData.scope,
        tokenType: tokenData.token_type || 'Bearer',
      };

      authLogger.info('New token object created', {
        expiresAt: new Date(newToken.expiresAt * 1000).toISOString(),
        refreshExpiresAt: new Date(newToken.refreshExpiresAt * 1000).toISOString(),
        scope: newToken.scope,
        tokenType: newToken.tokenType,
        usedExistingRefreshToken: !tokenData.refresh_token,
      });

      // 存储新令牌
      authLogger.info('Storing refreshed token');
      await TokenStorage.storeToken(newToken);

      // 如果收到了新的 ID token，更新用户信息
      if (newToken.idToken && tokenData.id_token) {
        authLogger.info('New ID token received, updating user info');
        try {
          const user = await this.getUserInfo();
          await TokenStorage.storeUserData(user);
          authLogger.info('User info updated from new ID token');
        } catch (error) {
          authLogger.warn('Failed to update user info from new ID token', error);
          // 这不应该阻止 token 刷新流程
        }
      }

      return newToken;
    } catch (error) {
      authLogger.error('Token refresh failed', error);
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * 获取用户信息（从 ID token 中提取）
   */
  async getUserInfo(): Promise<User> {
    authLogger.info('Extracting user info from ID token');

    try {
      const tokenData = await TokenStorage.getToken();
      if (!tokenData?.idToken) {
        authLogger.error('No ID token available for user info extraction');
        throw new Error('No ID token available');
      }

      authLogger.info('ID token found, extracting user info', tokenData.idToken);
      const userData = this.extractUserInfoFromToken(tokenData.idToken);

      if (!userData) {
        authLogger.error('Failed to extract user info from ID token');
        throw new Error('Failed to extract user info from ID token');
      }

      authLogger.info('User info extracted from token', {
        email: userData.email,
        emailVerified: userData.email_verified,
        hasAvatar: !!userData.picture,
        name: userData.name,
        sub: userData.sub,
      });

      const user: User = {
        avatar: userData.picture,
        createdAt: userData.updated_at || new Date().toISOString(),
        email: userData.email,
        emailVerified: userData.email_verified,
        id: userData.sub,
        name: userData.name,
        updatedAt: userData.updated_at || new Date().toISOString(),
        username: userData.preferred_username,
      };

      authLogger.info('User object created from token', user);
      return user;
    } catch (error) {
      authLogger.error('Failed to get user info from token', error);
      console.error('Failed to get user info from token:', error);
      throw error;
    }
  }

  /**
   * 刷新用户信息（从当前 ID token 中重新提取）
   */
  async refreshUserInfo(): Promise<User> {
    authLogger.info('Refreshing user info from current ID token');

    try {
      const user = await this.getUserInfo();
      await TokenStorage.storeUserData(user);
      authLogger.info('User info refreshed successfully');
      return user;
    } catch (error) {
      authLogger.error('Failed to refresh user info', error);
      console.error('Failed to refresh user info:', error);
      throw error;
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    authLogger.info('Starting logout process');

    try {
      // TODO: 服务端暂时未支持登出
      // const token = await TokenStorage.getAccessToken();
      // authLogger.info('Access token for logout', { hasToken: !!token });

      // // 尝试撤销令牌
      // if (token) {
      //   try {
      //     const revokeEndpoint = `${this.config.issuer}${AUTH_ENDPOINTS.REVOKE}`;
      //     authLogger.info('Revoking token at endpoint', revokeEndpoint);

      //     const response = await fetch(revokeEndpoint, {
      //       body: new URLSearchParams({
      //         client_id: this.config.clientId,
      //         token,
      //         token_type_hint: 'access_token',
      //       }).toString(),
      //       headers: {
      //         'Content-Type': 'application/x-www-form-urlencoded',
      //       },
      //       method: 'POST',
      //     });

      //     authLogger.info('Token revocation response', {
      //       status: response.status,
      //       statusText: response.statusText,
      //     });
      //   } catch (error) {
      //     authLogger.warn('Failed to revoke token', error);
      //     console.warn('Failed to revoke token:', error);
      //     // 撤销失败不应该阻止登出
      //   }
      // } else {
      //   authLogger.info('No token to revoke');
      // }

      // 清除本地存储
      authLogger.info('Clearing local storage');
      await TokenStorage.clearAll();
      authLogger.info('Logout completed successfully');
    } catch (error) {
      authLogger.error('Logout failed', error);
      console.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * 检查令牌是否有效
   */
  async isTokenValid(): Promise<boolean> {
    authLogger.info('Checking token validity');
    try {
      const token = await TokenStorage.getToken();
      if (!token) {
        authLogger.info('No token found');
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      const isValid = token.expiresAt > now;
      authLogger.info('Token validity check result', {
        expiresAt: new Date(token.expiresAt * 1000).toISOString(),
        isValid,
        now: new Date(now * 1000).toISOString(),
      });

      return isValid;
    } catch (error) {
      authLogger.error('Token validity check failed', error);
      return false;
    }
  }

  /**
   * 检查刷新令牌是否有效
   */
  async isRefreshTokenValid(): Promise<boolean> {
    authLogger.info('Checking refresh token validity');
    try {
      const token = await TokenStorage.getToken();
      if (!token || !token.refreshToken) {
        authLogger.info('No refresh token found');
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      const isValid = token.refreshExpiresAt > now;
      authLogger.info('Refresh token validity check result', {
        isValid,
        now: new Date(now * 1000).toISOString(),
        refreshExpiresAt: new Date(token.refreshExpiresAt * 1000).toISOString(),
      });

      return isValid;
    } catch (error) {
      authLogger.error('Refresh token validity check failed', error);
      return false;
    }
  }
}
