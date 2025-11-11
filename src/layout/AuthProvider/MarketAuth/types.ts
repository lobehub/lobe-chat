export interface MarketUserInfo {
  accountId: number;
  clientId: string;
  grantId: string;
  scopes: string[];
  sub: string;
  tokenData: {
    accountId: string;
    clientId: string;
    exp: number;
    expiresWithSession: boolean;
    grantId: string;
    gty: string;
    iat: number;
    jti: string;
    kind: string;
    scope: string;
    sessionUid: string;
  };
}

export interface MarketAuthSession {
  accessToken: string;
  expiresAt: number;
  expiresIn: number;
  scope: string;
  tokenType: 'Bearer';
  userInfo?: MarketUserInfo;
}

export interface MarketAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: MarketAuthSession | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

export interface MarketAuthContextType extends MarketAuthState {
  getCurrentUserInfo: () => MarketUserInfo | null;
  refreshToken: () => Promise<boolean>;
  signIn: () => Promise<number | null>;
  signOut: () => void;
}

export interface OIDCConfig {
  baseUrl: string;
  clientId: string;
  redirectUri: string;
  scope: string;
}

export interface PKCEParams {
  codeChallenge: string;
  codeVerifier: string;
  state: string;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  idToken?: string;
  scope: string;
  tokenType: string;
}
