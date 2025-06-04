/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { boolean, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './user';

// Roles table
export const roles = pgTable('roles', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull().unique(), // Role name, e.g.: admin, user, guest
  displayName: text('display_name').notNull(), // Display name
  description: text('description'), // Role description
  isSystem: boolean('is_system').default(false).notNull(), // Whether it's a system role
  isActive: boolean('is_active').default(true).notNull(), // Whether it's active

  ...timestamps,
});

export type NewRole = typeof roles.$inferInsert;
export type RoleItem = typeof roles.$inferSelect;

// Permissions table
export const permissions = pgTable('permissions', {
  id: text('id').primaryKey().notNull(),
  code: text('code').notNull().unique(), // Permission code, e.g.: chat:create, file:upload
  name: text('name').notNull(), // Permission name
  description: text('description'), // Permission description
  module: text('module').notNull(), // Module it belongs to, e.g.: chat, file, user
  isActive: boolean('is_active').default(true).notNull(), // Whether it's active

  ...timestamps,
});

export type NewPermission = typeof permissions.$inferInsert;
export type PermissionItem = typeof permissions.$inferSelect;

// Role-permission association table
export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: text('role_id')
      .references(() => roles.id, { onDelete: 'cascade' })
      .notNull(),
    permissionId: text('permission_id')
      .references(() => permissions.id, { onDelete: 'cascade' })
      .notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (self) => ({
    id: primaryKey({ columns: [self.roleId, self.permissionId] }),
  }),
);

export type NewRolePermission = typeof rolePermissions.$inferInsert;
export type RolePermissionItem = typeof rolePermissions.$inferSelect;

// User-role association table
export const userRoles = pgTable(
  'user_roles',
  {
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    roleId: text('role_id')
      .references(() => roles.id, { onDelete: 'cascade' })
      .notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }), // Support for temporary roles
  },
  (self) => ({
    id: primaryKey({ columns: [self.userId, self.roleId] }),
  }),
);

export type NewUserRole = typeof userRoles.$inferInsert;
export type UserRoleItem = typeof userRoles.$inferSelect;
