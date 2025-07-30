import * as Crypto from 'expo-crypto';
import { PKCE } from '@/mobile/types/user';
import { authLogger } from '@/mobile/utils/logger';
import { AUTH_ENDPOINTS } from '@/mobile/config/auth';

export class PKCEUtils {
  /**
   * 生成随机字符串
   */
  private static generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const values = new Uint8Array(length);

    // 使用 crypto.getRandomValues 生成随机值
    for (let i = 0; i < length; i++) {
      values[i] = Math.floor(Math.random() * charset.length);
      result += charset[values[i]];
    }

    return result;
  }

  /**
   * 生成 code verifier（43-128 字符的随机字符串）
   */
  static generateCodeVerifier(): string {
    const length = 128; // 使用最大长度以提高安全性
    return this.generateRandomString(length);
  }

  /**
   * 生成 code challenge（code verifier 的 SHA256 哈希的 base64url 编码）
   */
  static async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier,
      {
        encoding: Crypto.CryptoEncoding.BASE64,
      },
    );
    // 手动转换为 base64url 格式
    return digest.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  }

  /**
   * 生成 state 参数（防止 CSRF 攻击）
   */
  static generateState(): string {
    return this.generateRandomString(32);
  }

  /**
   * 生成 nonce 参数（防止重放攻击）
   */
  static generateNonce(): string {
    return this.generateRandomString(32);
  }

  /**
   * 生成完整的 PKCE 参数
   */
  static async generatePKCEParameters(): Promise<PKCE> {
    authLogger.info('Generating PKCE parameters');
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = this.generateState();
    const nonce = this.generateNonce();

    const pkce = {
      codeChallenge,
      codeChallengeMethod: 'S256',
      codeVerifier,
      nonce,
      state,
    };

    authLogger.info('PKCE parameters generated', {
      codeChallenge: pkce.codeChallenge,
      codeChallengeMethod: pkce.codeChallengeMethod,
      nonce: pkce.nonce,
      state: pkce.state,
    });

    return pkce;
  }

  /**
   * 验证 state 参数
   */
  static verifyState(receivedState: string, expectedState: string): boolean {
    return receivedState === expectedState;
  }

  /**
   * 构建授权 URL
   */
  static buildAuthorizationUrl(
    issuer: string,
    clientId: string,
    redirectUri: string,
    scopes: string[],
    pkce: PKCE,
    additionalParams?: Record<string, string>,
  ): string {
    authLogger.info('Building authorization URL', {
      additionalParams,
      clientId,
      issuer,
      redirectUri,
      scopes,
      state: pkce.state,
    });

    const params = new URLSearchParams({
      client_id: clientId,
      code_challenge: pkce.codeChallenge,
      code_challenge_method: pkce.codeChallengeMethod,
      nonce: pkce.nonce,
      redirect_uri: redirectUri,
      // TOOD: Check https://github.com/lobehub/lobe-chat/pull/8450
      resource: 'urn:lobehub:chat',

      response_type: 'code',
      scope: scopes.join(' '),
      state: pkce.state,
      ...additionalParams,
    });

    const authUrl = `${issuer}${AUTH_ENDPOINTS.AUTH}?${params.toString()}`;
    authLogger.info('Authorization URL built', authUrl);
    return authUrl;
  }

  /**
   * 解析回调 URL
   */
  static parseCallbackUrl(url: string): { code?: string; error?: string; state?: string } {
    authLogger.info('Parsing callback URL', url);
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);

      const result = {
        code: params.get('code') || undefined,
        error: params.get('error') || undefined,
        state: params.get('state') || undefined,
      };

      authLogger.info('Callback URL parsed', {
        error: result.error,
        hasCode: !!result.code,
        hasError: !!result.error,
        hasState: !!result.state,
      });

      return result;
    } catch (error) {
      authLogger.error('Failed to parse callback URL', error);
      console.error('Failed to parse callback URL:', error);
      return { error: 'invalid_callback_url' };
    }
  }
}
