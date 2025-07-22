/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { boolean, jsonb, pgTable, primaryKey, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { timestamps, timestamptz } from './_helpers';
import { users } from './user';

/**
 * OIDC 授权码
 * oidc-provider 需要持久化的模型之一
 */
export const oidcAuthorizationCodes = pgTable('oidc_authorization_codes', {
  id: varchar('id', { length: 255 }).primaryKey(),
  data: jsonb('data').notNull(),
  expiresAt: timestamptz('expires_at').notNull(),
  consumedAt: timestamptz('consumed_at'),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: varchar('client_id', { length: 255 }).notNull(),
  grantId: varchar('grant_id', { length: 255 }),
  ...timestamps,
});

/**
 * OIDC 访问令牌
 * oidc-provider 需要持久化的模型之一
 */
export const oidcAccessTokens = pgTable('oidc_access_tokens', {
  id: varchar('id', { length: 255 }).primaryKey(),
  data: jsonb('data').notNull(),
  expiresAt: timestamptz('expires_at').notNull(),
  consumedAt: timestamptz('consumed_at'),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: varchar('client_id', { length: 255 }).notNull(),
  grantId: varchar('grant_id', { length: 255 }),
  ...timestamps,
});

/**
 * OIDC 刷新令牌
 * oidc-provider 需要持久化的模型之一
 */
export const oidcRefreshTokens = pgTable('oidc_refresh_tokens', {
  id: varchar('id', { length: 255 }).primaryKey(),
  data: jsonb('data').notNull(),
  expiresAt: timestamptz('expires_at').notNull(),
  consumedAt: timestamptz('consumed_at'),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: varchar('client_id', { length: 255 }).notNull(),
  grantId: varchar('grant_id', { length: 255 }),
  ...timestamps,
});

/**
 * OIDC 设备代码
 * oidc-provider 需要持久化的模型之一
 */
export const oidcDeviceCodes = pgTable('oidc_device_codes', {
  id: varchar('id', { length: 255 }).primaryKey(),
  data: jsonb('data').notNull(),
  expiresAt: timestamptz('expires_at').notNull(),
  consumedAt: timestamptz('consumed_at'),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  clientId: varchar('client_id', { length: 255 }).notNull(),
  grantId: varchar('grant_id', { length: 255 }),
  userCode: varchar('user_code', { length: 255 }),
  ...timestamps,
});

/**
 * OIDC 交互会话
 * oidc-provider 需要持久化的模型之一
 */
export const oidcInteractions = pgTable('oidc_interactions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  data: jsonb('data').notNull(),
  expiresAt: timestamptz('expires_at').notNull(),
  ...timestamps,
});

/**
 * OIDC 授权记录
 * oidc-provider 需要持久化的模型之一
 */
export const oidcGrants = pgTable('oidc_grants', {
  id: varchar('id', { length: 255 }).primaryKey(),
  data: jsonb('data').notNull(),
  expiresAt: timestamptz('expires_at').notNull(),
  consumedAt: timestamptz('consumed_at'),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: varchar('client_id', { length: 255 }).notNull(),
  ...timestamps,
});

/**
 * OIDC 客户端配置
 * 存储 OIDC 客户端配置信息
 */
export const oidcClients = pgTable('oidc_clients', {
  id: varchar('id', { length: 255 }).primaryKey(), // client_id
  name: text('name').notNull(),
  description: text('description'),
  clientSecret: varchar('client_secret', { length: 255 }), // 公共客户端可为 null
  redirectUris: text('redirect_uris').array().notNull(),
  grants: text('grants').array().notNull(),
  responseTypes: text('response_types').array().notNull(),
  scopes: text('scopes').array().notNull(),
  tokenEndpointAuthMethod: varchar('token_endpoint_auth_method', { length: 20 }),
  applicationType: varchar('application_type', { length: 20 }),
  clientUri: text('client_uri'),
  logoUri: text('logo_uri'),
  policyUri: text('policy_uri'),
  tosUri: text('tos_uri'),
  isFirstParty: boolean('is_first_party').default(false),
  ...timestamps,
});

/**
 * OIDC 会话
 * oidc-provider 需要持久化的模型之一
 */
export const oidcSessions = pgTable('oidc_sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  data: jsonb('data').notNull(),
  expiresAt: timestamptz('expires_at').notNull(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  ...timestamps,
});

/**
 * OIDC 授权同意记录
 * 记录用户对客户端的授权同意历史
 */
export const oidcConsents = pgTable(
  'oidc_consents',
  {
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    clientId: varchar('client_id', { length: 255 })
      .references(() => oidcClients.id, { onDelete: 'cascade' })
      .notNull(),
    scopes: text('scopes').array().notNull(),
    expiresAt: timestamptz('expires_at'),
    ...timestamps,
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.clientId] }),
  }),
);

/**
 * 通用认证凭证传递表
 * 用于在不同客户端（桌面端、浏览器插件、移动端等）之间安全传递认证凭证
 *
 * 工作流程:
 * 1. 客户端生成唯一的 handoff ID
 * 2. 将 handoff ID 作为参数附加到 OAuth redirect_uri
 * 3. 认证成功后，中间页将凭证存储到此表
 * 4. 客户端轮询此表获取凭证
 * 5. 成功获取后立即删除记录
 */
export const oauthHandoffs = pgTable('oauth_handoffs', {
  /**
   * 由客户端生成的一次性唯一标识符
   * 用于客户端轮询时认领自己的凭证
   */
  id: text('id').primaryKey(),

  /**
   * 客户端类型标识
   * 如: 'desktop', 'browser-extension', 'mobile-app' 等
   */
  client: varchar('client', { length: 50 }).notNull(),

  /**
   * 凭证数据的 JSON 载荷
   * 灵活存储不同认证流程所需的各种数据
   * 当前主要包含: { code: string; state: string }
   */
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),

  /**
   * 时间戳字段，用于 TTL 控制
   * 凭证应在创建后 5 分钟内被消费，否则视为过期
   */
  ...timestamps,
});

// Zod schemas for validation
export const insertAuthHandoffSchema = createInsertSchema(oauthHandoffs);
export const selectAuthHandoffSchema = createSelectSchema(oauthHandoffs);

export type OAuthHandoffItem = typeof oauthHandoffs.$inferSelect;
export type NewOAuthHandoff = typeof oauthHandoffs.$inferInsert;
