import { OIDCConfig, PKCEParams, TokenResponse } from './types';

/**
 * Market OIDC 授权工具类
 */
export class MarketOIDC {
  private config: OIDCConfig;

  constructor(config: OIDCConfig) {
    this.config = config;
  }

  /**
   * 生成 PKCE code verifier
   */
  private generateCodeVerifier(): string {
    console.log('[MarketOIDC] Generating PKCE code verifier');
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll('=', '');
  }

  /**
   * 生成 PKCE code challenge
   */
  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    console.log('[MarketOIDC] Generating PKCE code challenge');
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll('=', '');
  }

  /**
   * 生成随机 state
   */
  private generateState(): string {
    console.log('[MarketOIDC] Generating random state');
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll('=', '');
  }

  /**
   * 生成 PKCE 参数
   */
  async generatePKCEParams(): Promise<PKCEParams> {
    console.log('[MarketOIDC] Generating PKCE parameters');
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = this.generateState();

    // 将参数存储到 sessionStorage 用于后续验证
    sessionStorage.setItem('market_code_verifier', codeVerifier);
    sessionStorage.setItem('market_state', state);

    console.log('[MarketOIDC] PKCE parameters generated and stored');
    return {
      codeChallenge,
      codeVerifier,
      state,
    };
  }

  /**
   * 构建授权 URL
   */
  async buildAuthUrl(): Promise<string> {
    console.log('[MarketOIDC] Building authorization URL');
    const pkceParams = await this.generatePKCEParams();

    const authUrl = new URL(`${this.config.baseUrl.replace(/\/$/, '')}/market-oidc/auth`);
    authUrl.searchParams.set('client_id', this.config.clientId);
    authUrl.searchParams.set('redirect_uri', this.config.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', this.config.scope);
    authUrl.searchParams.set('state', pkceParams.state);
    authUrl.searchParams.set('code_challenge', pkceParams.codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    console.log('[MarketOIDC] Authorization URL built:', authUrl.toString());
    return authUrl.toString();
  }

  /**
   * 用授权码换取访问令牌
   */
  async exchangeCodeForToken(code: string, state: string): Promise<TokenResponse> {
    console.log('[MarketOIDC] Exchanging authorization code for token');

    // 验证 state 参数
    const storedState = sessionStorage.getItem('market_state');
    if (state !== storedState) {
      console.error('[MarketOIDC] State parameter mismatch');
      throw new Error('Invalid state parameter');
    }

    // 获取存储的 code verifier
    const codeVerifier = sessionStorage.getItem('market_code_verifier');
    if (!codeVerifier) {
      console.error('[MarketOIDC] Code verifier not found');
      throw new Error('Code verifier not found');
    }

    const tokenUrl = `${this.config.baseUrl.replace(/\/$/, '')}/market-oidc/token`;
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: this.config.redirectUri,
    });

    console.log('[MarketOIDC] Sending token exchange request');
    const response = await fetch(tokenUrl, {
      body: body.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = `Token exchange failed: ${response.status} ${response.statusText} ${errorData.error_description || errorData.error || ''}`;
      console.error('[MarketOIDC]', errorMessage);
      throw new Error(errorMessage);
    }

    const tokenData = (await response.json()) as TokenResponse;
    console.log('[MarketOIDC] Token exchange successful');

    // 清理 sessionStorage 中的临时数据
    sessionStorage.removeItem('market_code_verifier');
    sessionStorage.removeItem('market_state');

    return tokenData;
  }

  /**
   * 启动授权流程并返回授权结果
   */
  async startAuthorization(): Promise<{ code: string; state: string }> {
    console.log('[MarketOIDC] Starting authorization flow');
    const authUrl = await this.buildAuthUrl();

    // 在新窗口中打开授权页面
    const popup = window.open(
      authUrl,
      'market_auth',
      'width=500,height=600,scrollbars=yes,resizable=yes',
    );

    if (!popup) {
      console.error('[MarketOIDC] Failed to open authorization popup');
      throw new Error('Failed to open authorization popup. Please check popup blocker settings.');
    }

    return new Promise((resolve, reject) => {
      let checkClosed: number;

      // 监听消息事件，等待授权完成
      const messageHandler = (event: MessageEvent) => {
        console.log('[MarketOIDC] Received message from popup:', event.data);

        if (event.data.type === 'MARKET_AUTH_SUCCESS') {
          window.removeEventListener('message', messageHandler);
          clearInterval(checkClosed);

          // 不立即关闭弹窗，让用户看到成功状态
          // 弹窗会在3秒后自动关闭
          resolve({
            code: event.data.code,
            state: event.data.state,
          });
        } else if (event.data.type === 'MARKET_AUTH_ERROR') {
          window.removeEventListener('message', messageHandler);
          popup.close();
          clearInterval(checkClosed);
          reject(new Error(event.data.error || 'Authorization failed'));
        }
      };

      window.addEventListener('message', messageHandler);

      // 检查弹窗是否被关闭
      checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          reject(new Error('Authorization popup was closed'));
        }
      }, 1000) as unknown as number;
    });
  }
}
