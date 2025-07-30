import { z } from 'zod';

// 用户基本信息
export const UserSchema = z.object({
  avatar: z.string().url().optional(),
  createdAt: z.string().datetime(),
  email: z.string().email(),
  emailVerified: z.boolean().optional(),
  id: z.string(),
  name: z.string().optional(),
  updatedAt: z.string().datetime(),
  username: z.string().optional(),
});

// OAuth 认证令牌
export const TokenSchema = z.object({
  accessToken: z.string(),
  expiresAt: z.number(),
  idToken: z.string().optional(),
  // Unix timestamp
  refreshExpiresAt: z.number(),

  refreshToken: z.string(),
  // Unix timestamp
  scope: z.string().optional(),
  tokenType: z.string().default('Bearer'),
});

// 认证状态
export const AuthStateSchema = z.object({
  error: z.string().nullable(),
  isAuthenticated: z.boolean(),
  isLoading: z.boolean(),
  token: TokenSchema.nullable(),
  user: UserSchema.nullable(),
});

// PKCE 参数
export const PKCESchema = z.object({
  codeChallenge: z.string(),
  codeChallengeMethod: z.string().default('S256'),
  codeVerifier: z.string(),
  nonce: z.string(),
  state: z.string(),
});

// 认证配置
export const AuthConfigSchema = z.object({
  additionalParameters: z.record(z.string()).optional(),
  clientId: z.string(),
  issuer: z.string(),
  redirectUri: z.string(),
  scopes: z.array(z.string()),
});

// 导出类型
export type User = z.infer<typeof UserSchema>;
export type Token = z.infer<typeof TokenSchema>;
export type AuthState = z.infer<typeof AuthStateSchema>;
export type PKCE = z.infer<typeof PKCESchema>;
export type AuthConfig = z.infer<typeof AuthConfigSchema>;

// 认证事件类型
export interface AuthEvents {
  onError: (error: string) => void;
  onLogin: (user: User) => void;
  onLogout: () => void;
  onTokenRefresh: (token: Token) => void;
}

// 认证服务接口
export interface AuthService {
  getUserInfo(): Promise<User>;
  isRefreshTokenValid(): Promise<boolean>;
  isTokenValid(): Promise<boolean>;
  login(): Promise<void>;
  logout(): Promise<void>;
  refreshToken(): Promise<Token>;
  refreshUserInfo(): Promise<User>;
}
