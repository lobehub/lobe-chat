export interface MarketAuthSession {
  accessToken: string;
  expiresAt: number;
  expiresIn: number;
  scope: string;
  tokenType: 'Bearer';
}

export interface MarketAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: MarketAuthSession | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

export interface MarketAuthContextType extends MarketAuthState {
  refreshToken: () => Promise<boolean>;
  signIn: () => Promise<void>;
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
  access_token: string;
  expires_in: number;
  id_token?: string;
  scope: string;
  token_type: string;
}
