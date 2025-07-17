import { TRPCError } from '@trpc/server';
import debug from 'debug';
import { importJWK, jwtVerify } from 'jose';

import { oidcEnv } from '@/envs/oidc';

const log = debug('oidc-jwt');

/**
 * 从环境变量中获取 JWKS
 * 该 JWKS 是一个包含 RS256 私钥的 JSON 对象
 */
export const getJWKS = (): object => {
  try {
    const jwksString = oidcEnv.OIDC_JWKS_KEY;

    if (!jwksString) {
      throw new Error(
        'OIDC_JWKS_KEY 环境变量是必需的。请使用 scripts/generate-oidc-jwk.mjs 生成 JWKS。',
      );
    }

    // 尝试解析 JWKS JSON 字符串
    const jwks = JSON.parse(jwksString);

    // 检查 JWKS 格式是否正确
    if (!jwks.keys || !Array.isArray(jwks.keys) || jwks.keys.length === 0) {
      throw new Error('JWKS 格式无效: 缺少或为空的 keys 数组');
    }

    // 检查是否有 RS256 算法的密钥
    const hasRS256Key = jwks.keys.some((key: any) => key.alg === 'RS256' && key.kty === 'RSA');
    if (!hasRS256Key) {
      throw new Error('JWKS 中没有找到 RS256 算法的 RSA 密钥');
    }

    return jwks;
  } catch (error) {
    console.error('解析 JWKS 失败:', error);
    throw new Error(`OIDC_JWKS_KEY 解析错误: ${(error as Error).message}`);
  }
};

/**
 * 从环境变量中获取 JWKS 并提取第一个 RSA 密钥
 */
const getJWKSPublicKey = async () => {
  try {
    const jwksString = oidcEnv.OIDC_JWKS_KEY;

    if (!jwksString) {
      throw new Error('OIDC_JWKS_KEY 环境变量未设置');
    }

    const jwks = JSON.parse(jwksString);

    if (!jwks.keys || !Array.isArray(jwks.keys) || jwks.keys.length === 0) {
      throw new Error('JWKS 格式无效: 缺少或为空的 keys 数组');
    }

    // 查找 RS256 算法的 RSA 密钥
    const rsaKey = jwks.keys.find((key: any) => key.alg === 'RS256' && key.kty === 'RSA');

    if (!rsaKey) {
      throw new Error('JWKS 中没有找到 RS256 算法的 RSA 密钥');
    }

    // 导入 JWK 为公钥
    const publicKey = await importJWK(rsaKey, 'RS256');

    return publicKey;
  } catch (error) {
    log('获取 JWKS 公钥失败: %O', error);
    throw new Error(`JWKS 公钥获取失败: ${(error as Error).message}`);
  }
};

/**
 * 验证 OIDC JWT Access Token
 * @param token - JWT access token
 * @returns 解析后的 token payload 和用户信息
 */
export const validateOIDCJWT = async (token: string) => {
  try {
    log('开始验证 OIDC JWT token');

    // 获取公钥
    const publicKey = await getJWKSPublicKey();

    // 验证 JWT
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: ['RS256'],
      // 可以添加其他验证选项，如 issuer、audience 等
    });

    log('JWT 验证成功，payload: %O', payload);

    // 提取用户信息
    const userId = payload.sub;
    const clientId = payload.aud;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'JWT token 中缺少用户 ID (sub)',
      });
    }

    return {
      clientId,
      payload,
      tokenData: {
        aud: clientId,
        client_id: clientId,
        exp: payload.exp,
        iat: payload.iat,
        jti: payload.jti,
        scope: payload.scope,
        sub: userId,
      },
      userId,
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    log('JWT 验证失败: %O', error);

    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: `JWT token 验证失败: ${(error as Error).message}`,
    });
  }
};
