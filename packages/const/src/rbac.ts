/**
 * RBAC Permission Actions Definition
 * Defines all executable permission action types in the system
 * Format: resource:action (e.g., agent:create, file:upload)
 */
export const PERMISSION_ACTIONS = {
  // ==================== Agent Management ====================
  AGENT_CREATE: 'agent:create',

  AGENT_DELETE: 'agent:delete',

  AGENT_FORK: 'agent:fork',

  AGENT_PUBLISH: 'agent:publish',

  AGENT_READ: 'agent:read',

  AGENT_SHARE: 'agent:share',

  AGENT_UPDATE: 'agent:update',

  // ==================== AI Infrastructure Management ====================
  AI_MODEL_CREATE: 'ai_model:create',

  AI_MODEL_DELETE: 'ai_model:delete',

  AI_MODEL_READ: 'ai_model:read',

  AI_MODEL_UPDATE: 'ai_model:update',

  AI_PROVIDER_CREATE: 'ai_provider:create',

  AI_PROVIDER_DELETE: 'ai_provider:delete',

  AI_PROVIDER_READ: 'ai_provider:read',

  AI_PROVIDER_UPDATE: 'ai_provider:update',

  // ==================== API Key Management ====================
  API_KEY_CREATE: 'api_key:create',

  API_KEY_DELETE: 'api_key:delete',

  API_KEY_READ: 'api_key:read',

  API_KEY_UPDATE: 'api_key:update',

  // ==================== Async Task Management ====================
  ASYNC_TASK_CANCEL: 'async_task:cancel',

  ASYNC_TASK_CREATE: 'async_task:create',

  ASYNC_TASK_READ: 'async_task:read',

  AUDIT_LOG_EXPORT: 'audit:log_export',

  // ==================== Audit Logs ====================
  AUDIT_LOG_READ: 'audit:log_read',

  // ==================== Authentication Management ====================
  AUTH_OAUTH_CONFIGURE: 'auth:oauth_configure',

  AUTH_OIDC_CONFIGURE: 'auth:oidc_configure',

  AUTH_SESSION_MANAGE: 'auth:session_manage',

  // ==================== Data Management ====================
  DATA_BACKUP: 'data:backup',

  DATA_EXPORT: 'data:export',

  DATA_IMPORT: 'data:import',

  DATA_RESTORE: 'data:restore',

  // ==================== Document Management ====================
  DOCUMENT_CHUNK: 'document:chunk',

  DOCUMENT_CREATE: 'document:create',

  DOCUMENT_DELETE: 'document:delete',

  DOCUMENT_READ: 'document:read',

  DOCUMENT_UPDATE: 'document:update',

  // ==================== File Management ====================
  FILE_DELETE: 'file:delete',

  FILE_DOWNLOAD: 'file:download',

  FILE_READ: 'file:read',

  FILE_SHARE: 'file:share',

  FILE_UPDATE: 'file:update',

  FILE_UPLOAD: 'file:upload',

  // ==================== Knowledge Base Management ====================
  KNOWLEDGE_BASE_CREATE: 'knowledge_base:create',

  KNOWLEDGE_BASE_DELETE: 'knowledge_base:delete',

  KNOWLEDGE_BASE_READ: 'knowledge_base:read',

  KNOWLEDGE_BASE_SHARE: 'knowledge_base:share',

  KNOWLEDGE_BASE_UPDATE: 'knowledge_base:update',

  // ==================== Message Management ====================
  MESSAGE_CREATE: 'message:create',

  MESSAGE_DELETE: 'message:delete',

  MESSAGE_FAVORITE: 'message:favorite',

  MESSAGE_READ: 'message:read',

  MESSAGE_REGENERATE: 'message:regenerate',

  MESSAGE_UPDATE: 'message:update',

  // ==================== Plugin Management ====================
  PLUGIN_CONFIGURE: 'plugin:configure',

  PLUGIN_DEVELOP: 'plugin:develop',

  PLUGIN_INSTALL: 'plugin:install',

  PLUGIN_UNINSTALL: 'plugin:uninstall',

  // ==================== RAG Features ====================
  RAG_EMBED: 'rag:embed',

  RAG_EVAL: 'rag:eval',

  RAG_SEARCH: 'rag:search',

  // ==================== RBAC Management ====================
  RBAC_PERMISSION_CREATE: 'rbac:permission_create',

  RBAC_PERMISSION_DELETE: 'rbac:permission_delete',

  RBAC_PERMISSION_READ: 'rbac:permission_read',

  RBAC_PERMISSION_UPDATE: 'rbac:permission_update',

  RBAC_ROLE_CREATE: 'rbac:role_create',

  RBAC_ROLE_DELETE: 'rbac:role_delete',

  RBAC_ROLE_PERMISSION_ASSIGN: 'rbac:role_permission_assign',

  RBAC_ROLE_PERMISSION_REVOKE: 'rbac:role_permission_revoke',

  RBAC_ROLE_READ: 'rbac:role_read',

  RBAC_ROLE_UPDATE: 'rbac:role_update',

  RBAC_SYSTEM_INIT: 'rbac:system_init',

  RBAC_USER_PERMISSION_VIEW: 'rbac:user_permission_view',

  RBAC_USER_ROLE_ASSIGN: 'rbac:user_role_assign',

  RBAC_USER_ROLE_REVOKE: 'rbac:user_role_revoke',

  // ==================== Session Management ====================
  SESSION_CREATE: 'session:create',

  SESSION_DELETE: 'session:delete',

  SESSION_EXPORT: 'session:export',

  // ==================== Session Group Management ====================
  SESSION_GROUP_CREATE: 'session_group:create',

  SESSION_GROUP_DELETE: 'session_group:delete',

  SESSION_GROUP_READ: 'session_group:read',

  SESSION_GROUP_UPDATE: 'session_group:update',

  SESSION_IMPORT: 'session:import',

  SESSION_READ: 'session:read',

  SESSION_SHARE: 'session:share',

  SESSION_UPDATE: 'session:update',

  // ==================== System Management ====================
  SYSTEM_BACKUP: 'system:backup',

  SYSTEM_CONFIGURE: 'system:configure',

  SYSTEM_LOG_VIEW: 'system:log_view',

  SYSTEM_MAINTENANCE: 'system:maintenance',

  SYSTEM_MONITOR: 'system:monitor',

  SYSTEM_RESTORE: 'system:restore',

  // ==================== Topic Management ====================
  TOPIC_CREATE: 'topic:create',

  TOPIC_DELETE: 'topic:delete',

  TOPIC_FAVORITE: 'topic:favorite',

  TOPIC_READ: 'topic:read',

  TOPIC_UPDATE: 'topic:update',

  // ==================== User Management ====================
  USER_CREATE: 'user:create',

  USER_DELETE: 'user:delete',

  USER_PROFILE_UPDATE: 'user:profile_update',

  USER_READ: 'user:read',

  USER_UPDATE: 'user:update',
} as const;

/**
 * Operation Scope Constants Definition
 */
export const PERMISSION_SCOPE = ['ALL', 'WORKSPACE', 'OWNER'] as const;

/**
 * RBAC System Permissions Definition
 * Combines permission actions with operation scopes to generate complete RBAC permission definitions
 * Format: resource:action:scope (e.g., agent:create:workspace, file:upload:owner)
 */
export const RBAC_PERMISSIONS = Object.entries(PERMISSION_ACTIONS).reduce(
  (acc, [key]) => {
    const permissionValue = PERMISSION_ACTIONS[key as keyof typeof PERMISSION_ACTIONS];

    const scopePermissions = PERMISSION_SCOPE.reduce(
      (scopeAcc, scope) => {
        const permissionWithScopeKey =
          `${key}_${scope}` as `${keyof typeof PERMISSION_ACTIONS}_${(typeof PERMISSION_SCOPE)[number]}`;

        scopeAcc[permissionWithScopeKey] = `${permissionValue}:${scope.toLowerCase()}`;
        return scopeAcc;
      },
      {} as Record<
        `${keyof typeof PERMISSION_ACTIONS}_${(typeof PERMISSION_SCOPE)[number]}`,
        string
      >,
    );

    return Object.assign(acc, scopePermissions);
  },
  {} as Record<`${keyof typeof PERMISSION_ACTIONS}_${(typeof PERMISSION_SCOPE)[number]}`, string>,
);

/**
 * RBAC Permissions Key Type Definition
 */
export type RBAC_PERMISSIONS_KEY = keyof typeof RBAC_PERMISSIONS;

export const ALL = 'ALL';

/**
 * RBAC Role Constants Definition
 */
export const SYSTEM_DEFAULT_ROLES = {
  SUPER_ADMIN: 'super_admin',
} as const;

/**
 * Role Description Mapping
 */
export const ROLE_DESCRIPTIONS = {
  [SYSTEM_DEFAULT_ROLES.SUPER_ADMIN]: 'Administrator with all system permissions',
} as const;
