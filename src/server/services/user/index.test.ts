import { UserJSON } from '@clerk/backend';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserItem } from '@/database/schemas';
import { UserModel } from '@/database/server/models/user';
import { pino } from '@/libs/logger';
import { AgentService } from '@/server/services/agent';

import { UserService } from './index';

// Mock dependencies
vi.mock('@/database/server/models/user', () => {
  const MockUserModel = vi.fn();
  // @ts-ignore
  MockUserModel.findById = vi.fn();
  // @ts-ignore
  MockUserModel.createUser = vi.fn();
  // @ts-ignore
  MockUserModel.deleteUser = vi.fn();

  // Mock instance methods
  MockUserModel.prototype.updateUser = vi.fn();

  return { UserModel: MockUserModel };
});

vi.mock('@/libs/logger', () => ({
  pino: {
    info: vi.fn(),
  },
}));

vi.mock('@/server/services/agent', () => ({
  AgentService: vi.fn().mockImplementation(() => ({
    createInbox: vi.fn().mockResolvedValue(undefined),
  })),
}));

let service: UserService;
const mockUserId = 'test-user-id';

// Mock user data
const mockUserJSON: UserJSON = {
  id: mockUserId,
  email_addresses: [{ id: 'email-1', email_address: 'test@example.com' }],
  phone_numbers: [{ id: 'phone-1', phone_number: '+1234567890' }],
  primary_email_address_id: 'email-1',
  primary_phone_number_id: 'phone-1',
  image_url: 'https://example.com/avatar.jpg',
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  created_at: '2023-01-01T00:00:00Z',
} as unknown as UserJSON;

beforeEach(() => {
  service = new UserService();
  vi.clearAllMocks();
});

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user when user does not exist', async () => {
      // Mock user not found
      vi.mocked(UserModel.findById).mockResolvedValue(null as any);

      const result = await service.createUser(mockUserId, mockUserJSON);

      expect(UserModel.findById).toHaveBeenCalledWith(expect.anything(), mockUserId);
      expect(UserModel.createUser).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          id: mockUserId,
          email: 'test@example.com',
          phone: '+1234567890',
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser',
          avatar: 'https://example.com/avatar.jpg',
          clerkCreatedAt: new Date('2023-01-01T00:00:00Z'),
        }),
      );
      expect(AgentService).toHaveBeenCalledWith(expect.anything(), mockUserId);
      expect(vi.mocked(AgentService).mock.results[0].value.createInbox).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'user created',
        success: true,
      });
    });

    it('should not create user if already exists', async () => {
      // Mock user found
      vi.mocked(UserModel.findById).mockResolvedValue({ id: mockUserId } as UserItem);

      const result = await service.createUser(mockUserId, mockUserJSON);

      expect(UserModel.findById).toHaveBeenCalledWith(expect.anything(), mockUserId);
      expect(UserModel.createUser).not.toHaveBeenCalled();
      expect(AgentService).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: 'user not created due to user already existing in the database',
        success: false,
      });
    });

    it('should handle user without primary phone number', async () => {
      vi.mocked(UserModel.findById).mockResolvedValue(null as any);

      const userWithoutPrimaryPhone = {
        ...mockUserJSON,
        primary_phone_number_id: null,
        phone_numbers: [{ id: 'phone-1', phone_number: '+1234567890' }],
      } as UserJSON;

      await service.createUser(mockUserId, userWithoutPrimaryPhone);

      expect(UserModel.createUser).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          phone: '+1234567890', // Should use first phone number
        }),
      );
      expect(AgentService).toHaveBeenCalledWith(expect.anything(), mockUserId);
      expect(vi.mocked(AgentService).mock.results[0].value.createInbox).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      await service.deleteUser(mockUserId);

      expect(UserModel.deleteUser).toHaveBeenCalledWith(expect.anything(), mockUserId);
    });

    it('should throw error if deletion fails', async () => {
      const error = new Error('Deletion failed');
      vi.mocked(UserModel.deleteUser).mockRejectedValue(error);

      await expect(service.deleteUser(mockUserId)).rejects.toThrow('Deletion failed');
    });
  });

  describe('updateUser', () => {
    it('should update user when user exists', async () => {
      // Mock user found
      vi.mocked(UserModel.findById).mockResolvedValue({ id: mockUserId } as UserItem);
      const mockUpdateUser = vi.mocked(UserModel.prototype.updateUser);

      const result = await service.updateUser(mockUserId, mockUserJSON);

      expect(UserModel.findById).toHaveBeenCalledWith(expect.anything(), mockUserId);
      expect(pino.info).toHaveBeenCalledWith('updating user due to clerk webhook');
      expect(mockUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUserId,
          email: 'test@example.com',
          phone: '+1234567890',
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser',
          avatar: 'https://example.com/avatar.jpg',
        }),
      );
      expect(result).toEqual({
        message: 'user updated',
        success: true,
      });
    });

    it('should not update user when user does not exist', async () => {
      // Mock user not found
      vi.mocked(UserModel.findById).mockResolvedValue(null as any);
      const mockUpdateUser = vi.mocked(UserModel.prototype.updateUser);

      const result = await service.updateUser(mockUserId, mockUserJSON);

      expect(UserModel.findById).toHaveBeenCalledWith(expect.anything(), mockUserId);
      expect(mockUpdateUser).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: "user not updated due to the user don't existing in the database",
        success: false,
      });
    });

    it('should handle user without primary email and phone', async () => {
      vi.mocked(UserModel.findById).mockResolvedValue({ id: mockUserId } as UserItem);
      const mockUpdateUser = vi.mocked(UserModel.prototype.updateUser);

      const userWithoutPrimaryContacts = {
        ...mockUserJSON,
        primary_email_address_id: null,
        primary_phone_number_id: null,
        email_addresses: [{ id: 'email-1', email_address: 'test@example.com' }],
        phone_numbers: [{ id: 'phone-1', phone_number: '+1234567890' }],
      } as UserJSON;

      await service.updateUser(mockUserId, userWithoutPrimaryContacts);

      // Verify that the first email and phone are used when primary is not specified
      expect(mockUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '+1234567890',
        }),
      );
    });

    it('should handle update failure', async () => {
      vi.mocked(UserModel.findById).mockResolvedValue({ id: mockUserId } as UserItem);
      const mockUpdateUser = vi.mocked(UserModel.prototype.updateUser);
      const error = new Error('Update failed');
      mockUpdateUser.mockRejectedValue(error);

      await expect(service.updateUser(mockUserId, mockUserJSON)).rejects.toThrow('Update failed');
    });
  });
});
