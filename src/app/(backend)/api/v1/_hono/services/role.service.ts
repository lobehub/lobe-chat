import { eq } from 'drizzle-orm';

import { RoleItem, roles } from '@/database/schemas/rbac';
import { LobeChatDatabase } from '@/database/type';

import { BaseService } from '../common/base.service';

export class RoleService extends BaseService {
  constructor(db: LobeChatDatabase, userId: string | null) {
    super(db, userId);
  }

  /**
   * Get all roles in the system
   * @returns Promise<RoleItem[]> - Array of all roles
   */
  async getAllRoles(): Promise<RoleItem[]> {
    return await this.db.select().from(roles).orderBy(roles.isSystem, roles.createdAt);
  }

  /**
   * Get all active roles in the system
   * @returns Promise<RoleItem[]> - Array of active roles
   */
  async getActiveRoles(): Promise<RoleItem[]> {
    return await this.db
      .select()
      .from(roles)
      .where(eq(roles.isActive, true))
      .orderBy(roles.isSystem, roles.createdAt);
  }

  /**
   * Get role by ID
   * @param id - Role ID
   * @returns Promise<RoleItem | undefined> - Role item or undefined if not found
   */
  async getRoleById(id: number): Promise<RoleItem | undefined> {
    const result = await this.db.select().from(roles).where(eq(roles.id, id)).limit(1);

    return result[0];
  }

  /**
   * Get role by name
   * @param name - Role name
   * @returns Promise<RoleItem | undefined> - Role item or undefined if not found
   */
  async getRoleByName(name: string): Promise<RoleItem | undefined> {
    const result = await this.db.select().from(roles).where(eq(roles.name, name)).limit(1);

    return result[0];
  }
}
