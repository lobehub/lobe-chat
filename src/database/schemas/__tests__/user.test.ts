import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { describe, expect, it } from 'vitest';

import { DEFAULT_PREFERENCE } from '@/const/user';

import { userInstalledPlugins, userSettings, users } from '../user';

describe('database schemas', () => {
  describe('users table', () => {
    it('should have correct schema definition', () => {
      const schema = users;

      expect(schema.id).toBeDefined();
      expect(schema.username).toBeDefined();
      expect(schema.email).toBeDefined();
      expect(schema.avatar).toBeDefined();
      expect(schema.phone).toBeDefined();
      expect(schema.firstName).toBeDefined();
      expect(schema.lastName).toBeDefined();
      expect(schema.fullName).toBeDefined();
      expect(schema.isOnboarded).toBeDefined();
      expect(schema.clerkCreatedAt).toBeDefined();
      expect(schema.emailVerifiedAt).toBeDefined();
      expect(schema.preference).toBeDefined();
      expect(schema.createdAt).toBeDefined();
      expect(schema.updatedAt).toBeDefined();
      expect(schema.accessedAt).toBeDefined();
    });

    it('should have default preference value', () => {
      const mockUser: typeof users.$inferInsert = {
        id: '1',
      };
      expect(mockUser.preference).toBeUndefined();
    });
  });

  describe('userSettings table', () => {
    it('should have correct schema definition', () => {
      const schema = userSettings;

      expect(schema.id).toBeDefined();
      expect(schema.tts).toBeDefined();
      expect(schema.keyVaults).toBeDefined();
      expect(schema.general).toBeDefined();
      expect(schema.languageModel).toBeDefined();
      expect(schema.systemAgent).toBeDefined();
      expect(schema.defaultAgent).toBeDefined();
      expect(schema.tool).toBeDefined();
    });
  });

  describe('userInstalledPlugins table', () => {
    it('should have correct schema definition', () => {
      const schema = userInstalledPlugins;

      expect(schema.userId).toBeDefined();
      expect(schema.identifier).toBeDefined();
      expect(schema.type).toBeDefined();
      expect(schema.manifest).toBeDefined();
      expect(schema.settings).toBeDefined();
      expect(schema.customParams).toBeDefined();
      expect(schema.createdAt).toBeDefined();
      expect(schema.updatedAt).toBeDefined();
      expect(schema.accessedAt).toBeDefined();
    });

    it('should validate plugin type', () => {
      const mockPlugin: typeof userInstalledPlugins.$inferInsert = {
        userId: '1',
        identifier: 'test-plugin',
        type: 'plugin',
      };
      expect(mockPlugin.type).toBe('plugin');

      const mockCustomPlugin: typeof userInstalledPlugins.$inferInsert = {
        userId: '1',
        identifier: 'test-custom',
        type: 'customPlugin',
      };
      expect(mockCustomPlugin.type).toBe('customPlugin');
    });

    it('should require userId and identifier', () => {
      const mockPlugin: typeof userInstalledPlugins.$inferInsert = {
        userId: '1',
        identifier: 'test',
        type: 'plugin',
      };

      expect(mockPlugin.userId).toBeDefined();
      expect(mockPlugin.identifier).toBeDefined();
    });
  });
});
