import { LobeChatDatabase } from '@/database/type';

import { NewPermission } from '../schemas';
import { RBACModel } from './rbac';

/**
 * RBAC System Initialization Data
 */
export class RBACSeeder {
  private rbacModel: RBACModel;

  constructor(db: LobeChatDatabase) {
    this.rbacModel = new RBACModel(db);
  }

  /**
   * Initialize system roles
   */
  private async seedRoles() {
    const systemRoles = [
      {
        description: 'Administrator with all system permissions',
        displayName: 'Administrator',
        id: 'admin',
        isActive: true,
        isSystem: true,
        name: 'admin',
      },
      {
        description: 'Regular user with basic usage permissions',
        displayName: 'Regular User',
        id: 'user',
        isActive: true,
        isSystem: true,
        name: 'user',
      },
    ];

    for (const role of systemRoles) {
      const existingRole = await this.rbacModel.getRoleByName(role.name);
      if (!existingRole) {
        await this.rbacModel.createRole(role);
        console.log(`✅ Created system role: ${role.displayName}`);
      }
    }
  }

  /**
   * Initialize system permissions
   */
  async seedPermissions() {
    const systemPermissions: NewPermission[] = [
      // ==================== User Management Permissions ====================
      {
        code: 'user:create',
        description: 'Permission to create new users',
        id: 'user_create',
        isActive: true,
        module: 'user',
        name: 'Create User',
      },
      {
        code: 'user:read',
        description: 'Permission to view user information',
        id: 'user_read',
        isActive: true,
        module: 'user',
        name: 'View User',
      },
      {
        code: 'user:update',
        description: 'Permission to update user information',
        id: 'user_update',
        isActive: true,
        module: 'user',
        name: 'Update User',
      },
      {
        code: 'user:delete',
        description: 'Permission to delete users',
        id: 'user_delete',
        isActive: true,
        module: 'user',
        name: 'Delete User',
      },
      {
        code: 'user:profile_update',
        description: 'Permission to update personal profile',
        id: 'user_profile_update',
        isActive: true,
        module: 'user',
        name: 'Update Personal Profile',
      },

      // ==================== Session Management Permissions ====================
      {
        code: 'session:create',
        description: 'Permission to create new sessions',
        id: 'session_create',
        isActive: true,
        module: 'session',
        name: 'Create Session',
      },
      {
        code: 'session:read',
        description: 'Permission to view sessions',
        id: 'session_read',
        isActive: true,
        module: 'session',
        name: 'View Session',
      },
      {
        code: 'session:update',
        description: 'Permission to update sessions',
        id: 'session_update',
        isActive: true,
        module: 'session',
        name: 'Update Session',
      },
      {
        code: 'session:delete',
        description: 'Permission to delete sessions',
        id: 'session_delete',
        isActive: true,
        module: 'session',
        name: 'Delete Session',
      },
      {
        code: 'session:share',
        description: 'Permission to share sessions',
        id: 'session_share',
        isActive: true,
        module: 'session',
        name: 'Share Session',
      },
      {
        code: 'session:export',
        description: 'Permission to export sessions',
        id: 'session_export',
        isActive: true,
        module: 'session',
        name: 'Export Session',
      },
      {
        code: 'session:import',
        description: 'Permission to import sessions',
        id: 'session_import',
        isActive: true,
        module: 'session',
        name: 'Import Session',
      },

      // ==================== Session Group Management Permissions ====================
      {
        code: 'session_group:create',
        description: 'Permission to create session groups',
        id: 'session_group_create',
        isActive: true,
        module: 'session_group',
        name: 'Create Session Group',
      },
      {
        code: 'session_group:read',
        description: 'Permission to view session groups',
        id: 'session_group_read',
        isActive: true,
        module: 'session_group',
        name: 'View Session Group',
      },
      {
        code: 'session_group:update',
        description: 'Permission to update session groups',
        id: 'session_group_update',
        isActive: true,
        module: 'session_group',
        name: 'Update Session Group',
      },
      {
        code: 'session_group:delete',
        description: 'Permission to delete session groups',
        id: 'session_group_delete',
        isActive: true,
        module: 'session_group',
        name: 'Delete Session Group',
      },

      // ==================== Topic Management Permissions ====================
      {
        code: 'topic:create',
        description: 'Permission to create topics',
        id: 'topic_create',
        isActive: true,
        module: 'topic',
        name: 'Create Topic',
      },
      {
        code: 'topic:read',
        description: 'Permission to view topics',
        id: 'topic_read',
        isActive: true,
        module: 'topic',
        name: 'View Topic',
      },
      {
        code: 'topic:update',
        description: 'Permission to update topics',
        id: 'topic_update',
        isActive: true,
        module: 'topic',
        name: 'Update Topic',
      },
      {
        code: 'topic:delete',
        description: 'Permission to delete topics',
        id: 'topic_delete',
        isActive: true,
        module: 'topic',
        name: 'Delete Topic',
      },
      {
        code: 'topic:favorite',
        description: 'Permission to favorite topics',
        id: 'topic_favorite',
        isActive: true,
        module: 'topic',
        name: 'Favorite Topic',
      },

      // ==================== Message Management Permissions ====================
      {
        code: 'message:create',
        description: 'Permission to send messages',
        id: 'message_create',
        isActive: true,
        module: 'message',
        name: 'Send Message',
      },
      {
        code: 'message:read',
        description: 'Permission to view messages',
        id: 'message_read',
        isActive: true,
        module: 'message',
        name: 'View Message',
      },
      {
        code: 'message:update',
        description: 'Permission to update messages',
        id: 'message_update',
        isActive: true,
        module: 'message',
        name: 'Update Message',
      },
      {
        code: 'message:delete',
        description: 'Permission to delete messages',
        id: 'message_delete',
        isActive: true,
        module: 'message',
        name: 'Delete Message',
      },
      {
        code: 'message:favorite',
        description: 'Permission to favorite messages',
        id: 'message_favorite',
        isActive: true,
        module: 'message',
        name: 'Favorite Message',
      },
      {
        code: 'message:regenerate',
        description: 'Permission to regenerate messages',
        id: 'message_regenerate',
        isActive: true,
        module: 'message',
        name: 'Regenerate Message',
      },

      // ==================== Agent Management Permissions ====================
      {
        code: 'agent:create',
        description: 'Permission to create agents',
        id: 'agent_create',
        isActive: true,
        module: 'agent',
        name: 'Create Agent',
      },
      {
        code: 'agent:read',
        description: 'Permission to view agents',
        id: 'agent_read',
        isActive: true,
        module: 'agent',
        name: 'View Agent',
      },
      {
        code: 'agent:update',
        description: 'Permission to update agents',
        id: 'agent_update',
        isActive: true,
        module: 'agent',
        name: 'Update Agent',
      },
      {
        code: 'agent:delete',
        description: 'Permission to delete agents',
        id: 'agent_delete',
        isActive: true,
        module: 'agent',
        name: 'Delete Agent',
      },
      {
        code: 'agent:share',
        description: 'Permission to share agents',
        id: 'agent_share',
        isActive: true,
        module: 'agent',
        name: 'Share Agent',
      },
      {
        code: 'agent:publish',
        description: 'Permission to publish agents',
        id: 'agent_publish',
        isActive: true,
        module: 'agent',
        name: 'Publish Agent',
      },
      {
        code: 'agent:fork',
        description: 'Permission to fork agents',
        id: 'agent_fork',
        isActive: true,
        module: 'agent',
        name: 'Fork Agent',
      },

      // ==================== File Management Permissions ====================
      {
        code: 'file:upload',
        description: 'Permission to upload files',
        id: 'file_upload',
        isActive: true,
        module: 'file',
        name: 'Upload File',
      },
      {
        code: 'file:read',
        description: 'Permission to view files',
        id: 'file_read',
        isActive: true,
        module: 'file',
        name: 'View File',
      },
      {
        code: 'file:update',
        description: 'Permission to update files',
        id: 'file_update',
        isActive: true,
        module: 'file',
        name: 'Update File',
      },
      {
        code: 'file:delete',
        description: 'Permission to delete files',
        id: 'file_delete',
        isActive: true,
        module: 'file',
        name: 'Delete File',
      },
      {
        code: 'file:download',
        description: 'Permission to download files',
        id: 'file_download',
        isActive: true,
        module: 'file',
        name: 'Download File',
      },
      {
        code: 'file:share',
        description: 'Permission to share files',
        id: 'file_share',
        isActive: true,
        module: 'file',
        name: 'Share File',
      },

      // ==================== Knowledge Base Management Permissions ====================
      {
        code: 'knowledge_base:create',
        description: 'Permission to create knowledge bases',
        id: 'knowledge_base_create',
        isActive: true,
        module: 'knowledge_base',
        name: 'Create Knowledge Base',
      },
      {
        code: 'knowledge_base:read',
        description: 'Permission to view knowledge bases',
        id: 'knowledge_base_read',
        isActive: true,
        module: 'knowledge_base',
        name: 'View Knowledge Base',
      },
      {
        code: 'knowledge_base:update',
        description: 'Permission to update knowledge bases',
        id: 'knowledge_base_update',
        isActive: true,
        module: 'knowledge_base',
        name: 'Update Knowledge Base',
      },
      {
        code: 'knowledge_base:delete',
        description: 'Permission to delete knowledge bases',
        id: 'knowledge_base_delete',
        isActive: true,
        module: 'knowledge_base',
        name: 'Delete Knowledge Base',
      },
      {
        code: 'knowledge_base:share',
        description: 'Permission to share knowledge bases',
        id: 'knowledge_base_share',
        isActive: true,
        module: 'knowledge_base',
        name: 'Share Knowledge Base',
      },

      // ==================== Document Management Permissions ====================
      {
        code: 'document:create',
        description: 'Permission to create documents',
        id: 'document_create',
        isActive: true,
        module: 'document',
        name: 'Create Document',
      },
      {
        code: 'document:read',
        description: 'Permission to view documents',
        id: 'document_read',
        isActive: true,
        module: 'document',
        name: 'View Document',
      },
      {
        code: 'document:update',
        description: 'Permission to update documents',
        id: 'document_update',
        isActive: true,
        module: 'document',
        name: 'Update Document',
      },
      {
        code: 'document:delete',
        description: 'Permission to delete documents',
        id: 'document_delete',
        isActive: true,
        module: 'document',
        name: 'Delete Document',
      },
      {
        code: 'document:chunk',
        description: 'Permission to chunk documents',
        id: 'document_chunk',
        isActive: true,
        module: 'document',
        name: 'Document Chunking',
      },

      // ==================== API Key Management Permissions ====================
      {
        code: 'api_key:create',
        description: 'Permission to create API keys',
        id: 'api_key_create',
        isActive: true,
        module: 'api_key',
        name: 'Create API Key',
      },
      {
        code: 'api_key:read',
        description: 'Permission to view API keys',
        id: 'api_key_read',
        isActive: true,
        module: 'api_key',
        name: 'View API Key',
      },
      {
        code: 'api_key:update',
        description: 'Permission to update API keys',
        id: 'api_key_update',
        isActive: true,
        module: 'api_key',
        name: 'Update API Key',
      },
      {
        code: 'api_key:delete',
        description: 'Permission to delete API keys',
        id: 'api_key_delete',
        isActive: true,
        module: 'api_key',
        name: 'Delete API Key',
      },

      // ==================== AI Infrastructure Management Permissions ====================
      {
        code: 'ai_provider:create',
        description: 'Permission to create AI providers',
        id: 'ai_provider_create',
        isActive: true,
        module: 'ai_provider',
        name: 'Create AI Provider',
      },
      {
        code: 'ai_provider:read',
        description: 'Permission to view AI providers',
        id: 'ai_provider_read',
        isActive: true,
        module: 'ai_provider',
        name: 'View AI Provider',
      },
      {
        code: 'ai_provider:update',
        description: 'Permission to update AI providers',
        id: 'ai_provider_update',
        isActive: true,
        module: 'ai_provider',
        name: 'Update AI Provider',
      },
      {
        code: 'ai_provider:delete',
        description: 'Permission to delete AI providers',
        id: 'ai_provider_delete',
        isActive: true,
        module: 'ai_provider',
        name: 'Delete AI Provider',
      },
      {
        code: 'ai_model:use',
        description: 'Permission to use AI models',
        id: 'ai_model_use',
        isActive: true,
        module: 'ai_model',
        name: 'Use AI Model',
      },
      {
        code: 'ai_model:configure',
        description: 'Permission to configure AI models',
        id: 'ai_model_configure',
        isActive: true,
        module: 'ai_model',
        name: 'Configure AI Model',
      },

      // ==================== Plugin Management Permissions ====================
      {
        code: 'plugin:install',
        description: 'Permission to install plugins',
        id: 'plugin_install',
        isActive: true,
        module: 'plugin',
        name: 'Install Plugin',
      },
      {
        code: 'plugin:uninstall',
        description: 'Permission to uninstall plugins',
        id: 'plugin_uninstall',
        isActive: true,
        module: 'plugin',
        name: 'Uninstall Plugin',
      },
      {
        code: 'plugin:configure',
        description: 'Permission to configure plugins',
        id: 'plugin_configure',
        isActive: true,
        module: 'plugin',
        name: 'Configure Plugin',
      },
      {
        code: 'plugin:develop',
        description: 'Permission to develop plugins',
        id: 'plugin_develop',
        isActive: true,
        module: 'plugin',
        name: 'Develop Plugin',
      },

      // ==================== RAG Feature Permissions ====================
      {
        code: 'rag:search',
        description: 'Permission for RAG search',
        id: 'rag_search',
        isActive: true,
        module: 'rag',
        name: 'RAG Search',
      },
      {
        code: 'rag:embed',
        description: 'Permission for RAG embedding',
        id: 'rag_embed',
        isActive: true,
        module: 'rag',
        name: 'RAG Embedding',
      },
      {
        code: 'rag:eval',
        description: 'Permission for RAG evaluation',
        id: 'rag_eval',
        isActive: true,
        module: 'rag',
        name: 'RAG Evaluation',
      },

      // ==================== Async Task Management Permissions ====================
      {
        code: 'async_task:create',
        description: 'Permission to create async tasks',
        id: 'async_task_create',
        isActive: true,
        module: 'async_task',
        name: 'Create Async Task',
      },
      {
        code: 'async_task:read',
        description: 'Permission to view async tasks',
        id: 'async_task_read',
        isActive: true,
        module: 'async_task',
        name: 'View Async Task',
      },
      {
        code: 'async_task:cancel',
        description: 'Permission to cancel async tasks',
        id: 'async_task_cancel',
        isActive: true,
        module: 'async_task',
        name: 'Cancel Async Task',
      },

      // ==================== System Management Permissions ====================
      {
        code: 'system:configure',
        description: 'Permission for system configuration',
        id: 'system_configure',
        isActive: true,
        module: 'system',
        name: 'System Configuration',
      },
      {
        code: 'system:monitor',
        description: 'Permission for system monitoring',
        id: 'system_monitor',
        isActive: true,
        module: 'system',
        name: 'System Monitoring',
      },
      {
        code: 'system:backup',
        description: 'Permission for system backup',
        id: 'system_backup',
        isActive: true,
        module: 'system',
        name: 'System Backup',
      },
      {
        code: 'system:restore',
        description: 'Permission for system restore',
        id: 'system_restore',
        isActive: true,
        module: 'system',
        name: 'System Restore',
      },
      {
        code: 'system:log_view',
        description: 'Permission to view system logs',
        id: 'system_log_view',
        isActive: true,
        module: 'system',
        name: 'View System Logs',
      },
      {
        code: 'system:maintenance',
        description: 'Permission for system maintenance',
        id: 'system_maintenance',
        isActive: true,
        module: 'system',
        name: 'System Maintenance',
      },

      // ==================== Authentication Management Permissions ====================
      {
        code: 'auth:oauth_configure',
        description: 'Permission for OAuth configuration',
        id: 'auth_oauth_configure',
        isActive: true,
        module: 'auth',
        name: 'OAuth Configuration',
      },
      {
        code: 'auth:oidc_configure',
        description: 'Permission for OIDC configuration',
        id: 'auth_oidc_configure',
        isActive: true,
        module: 'auth',
        name: 'OIDC Configuration',
      },
      {
        code: 'auth:session_manage',
        description: 'Permission for authentication session management',
        id: 'auth_session_manage',
        isActive: true,
        module: 'auth',
        name: 'Session Management',
      },

      // ==================== Data Management Permissions ====================
      {
        code: 'data:export',
        description: 'Permission for data export',
        id: 'data_export',
        isActive: true,
        module: 'data',
        name: 'Data Export',
      },
      {
        code: 'data:import',
        description: 'Permission for data import',
        id: 'data_import',
        isActive: true,
        module: 'data',
        name: 'Data Import',
      },
      {
        code: 'data:backup',
        description: 'Permission for data backup',
        id: 'data_backup',
        isActive: true,
        module: 'data',
        name: 'Data Backup',
      },
      {
        code: 'data:restore',
        description: 'Permission for data restore',
        id: 'data_restore',
        isActive: true,
        module: 'data',
        name: 'Data Restore',
      },

      // ==================== Audit Log Permissions ====================
      {
        code: 'audit:log_read',
        description: 'Permission to view audit logs',
        id: 'audit_log_read',
        isActive: true,
        module: 'audit',
        name: 'View Audit Logs',
      },
      {
        code: 'audit:log_export',
        description: 'Permission to export audit logs',
        id: 'audit_log_export',
        isActive: true,
        module: 'audit',
        name: 'Export Audit Logs',
      },

      // ==================== RBAC Management Permissions ====================
      {
        code: 'rbac:permission_create',
        description: 'Permission to create new permissions',
        id: 'rbac_permission_create',
        isActive: true,
        module: 'rbac',
        name: 'Create Permission',
      },
      {
        code: 'rbac:permission_delete',
        description: 'Permission to delete permissions',
        id: 'rbac_permission_delete',
        isActive: true,
        module: 'rbac',
        name: 'Delete Permission',
      },
      {
        code: 'rbac:permission_read',
        description: 'Permission to view permissions',
        id: 'rbac_permission_read',
        isActive: true,
        module: 'rbac',
        name: 'View Permission',
      },
      {
        code: 'rbac:permission_update',
        description: 'Permission to update permissions',
        id: 'rbac_permission_update',
        isActive: true,
        module: 'rbac',
        name: 'Update Permission',
      },
      {
        code: 'rbac:role_create',
        description: 'Permission to create new roles',
        id: 'rbac_role_create',
        isActive: true,
        module: 'rbac',
        name: 'Create Role',
      },
      {
        code: 'rbac:role_delete',
        description: 'Permission to delete roles',
        id: 'rbac_role_delete',
        isActive: true,
        module: 'rbac',
        name: 'Delete Role',
      },
      {
        code: 'rbac:role_permission_assign',
        description: 'Permission to assign permissions to roles',
        id: 'rbac_role_permission_assign',
        isActive: true,
        module: 'rbac',
        name: 'Assign Role Permission',
      },
      {
        code: 'rbac:role_permission_revoke',
        description: 'Permission to revoke permissions from roles',
        id: 'rbac_role_permission_revoke',
        isActive: true,
        module: 'rbac',
        name: 'Revoke Role Permission',
      },
      {
        code: 'rbac:role_read',
        description: 'Permission to view roles',
        id: 'rbac_role_read',
        isActive: true,
        module: 'rbac',
        name: 'View Role',
      },
      {
        code: 'rbac:role_update',
        description: 'Permission to update roles',
        id: 'rbac_role_update',
        isActive: true,
        module: 'rbac',
        name: 'Update Role',
      },
      {
        code: 'rbac:system_init',
        description: 'Permission to initialize RBAC system',
        id: 'rbac_system_init',
        isActive: true,
        module: 'rbac',
        name: 'Initialize RBAC System',
      },
      {
        code: 'rbac:user_permission_view',
        description: 'Permission to view user permissions',
        id: 'rbac_user_permission_view',
        isActive: true,
        module: 'rbac',
        name: 'View User Permissions',
      },
      {
        code: 'rbac:user_role_assign',
        description: 'Permission to assign roles to users',
        id: 'rbac_user_role_assign',
        isActive: true,
        module: 'rbac',
        name: 'Assign User Role',
      },
      {
        code: 'rbac:user_role_revoke',
        description: 'Permission to revoke roles from users',
        id: 'rbac_user_role_revoke',
        isActive: true,
        module: 'rbac',
        name: 'Revoke User Role',
      },
    ];

    for (const permission of systemPermissions) {
      const existingPermission = await this.rbacModel.getPermissionByCode(permission.code!);
      if (!existingPermission) {
        await this.rbacModel.createPermission(permission);
        console.log(`✅ Created system permission: ${permission.name} (${permission.code})`);
      }
    }
  }

  /**
   * Initialize role permission associations
   */
  private async seedRolePermissions() {
    const allPermissions = await this.rbacModel.getPermissions();

    // Administrator has all permissions
    const adminRole = await this.rbacModel.getRoleByName('admin');
    if (adminRole) {
      const permissionIds = allPermissions.map((p) => p.id);
      await this.rbacModel.assignPermissionsToRole(adminRole.id, permissionIds);
      console.log(`✅ Assigned all permissions to administrator`);
    }

    // Regular user permissions (Demo example - actual permissions are configured by administrators)
    const userRole = await this.rbacModel.getRoleByName('user');
    if (userRole) {
      // This is just a Demo example showing how to assign basic permissions to regular users
      // In production environment, permissions should be configured by administrators through management interface
      const userPermissionCodes = new Set<string>([]);

      const userPermissions = allPermissions.filter((p) => userPermissionCodes.has(p.code));
      const permissionIds = userPermissions.map((p) => p.id);
      await this.rbacModel.assignPermissionsToRole(userRole.id, permissionIds);
      console.log(
        `✅ Assigned Demo permissions to regular users (${userPermissions.length} permissions)`,
      );
    }
  }

  /**
   * Execute complete RBAC system initialization
   */
  async seedAll() {
    console.log('🚀 Starting RBAC system initialization...');

    try {
      await this.seedRoles();
      await this.seedPermissions();
      await this.seedRolePermissions();

      console.log('✅ RBAC system initialization completed!');
    } catch (error) {
      console.error('❌ RBAC system initialization failed:', error);
      throw error;
    }
  }
}
