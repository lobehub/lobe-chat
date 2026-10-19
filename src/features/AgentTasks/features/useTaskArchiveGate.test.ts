import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTaskArchiveGate } from './useTaskArchiveGate';

const mocks = vi.hoisted(() => ({
  canEdit: true,
  currentUserId: 'me',
  isAdmin: false,
  isOwner: false,
}));

vi.mock('@/hooks/usePermission', () => ({
  usePermission: () => ({ allowed: mocks.canEdit }),
}));

vi.mock('@/business/client/hooks/useIsWorkspaceAdmin', () => ({
  useIsWorkspaceAdmin: () => mocks.isAdmin,
}));

vi.mock('@/business/client/hooks/useIsWorkspaceOwner', () => ({
  useIsWorkspaceOwner: () => mocks.isOwner,
}));

vi.mock('@/store/user', () => ({
  useUserStore: (selector: (state: { id: string }) => unknown) =>
    selector({ id: mocks.currentUserId }),
}));

vi.mock('@/store/user/selectors', () => ({
  userProfileSelectors: { userId: (state: { id: string }) => state.id },
}));

const check = (createdByUserId?: string | null, options?: { archiveBlocked?: boolean }) =>
  renderHook(() => useTaskArchiveGate()).result.current(createdByUserId, options);

describe('useTaskArchiveGate', () => {
  beforeEach(() => {
    mocks.canEdit = true;
    mocks.isAdmin = false;
    mocks.isOwner = false;
  });

  it('lets the creator archive their own task', () => {
    expect(check('me')).toEqual({ allowed: true });
  });

  it("explains why a member can't archive someone else's task", () => {
    expect(check('someone-else')).toEqual({
      allowed: false,
      reasonKey: 'taskList.contextMenu.archiveDenied.notCreatorOrAdmin',
    });
  });

  it("lets a workspace owner or admin archive someone else's task", () => {
    mocks.isOwner = true;
    expect(check('someone-else')).toEqual({ allowed: true });

    mocks.isOwner = false;
    mocks.isAdmin = true;
    expect(check('someone-else')).toEqual({ allowed: true });
  });

  it('explains that live work must stop before archiving, but not before restoring', () => {
    expect(check('me', { archiveBlocked: true })).toEqual({
      allowed: false,
      reasonKey: 'taskList.contextMenu.archiveBlocked',
    });
    expect(check('me', { archiveBlocked: false })).toEqual({ allowed: true });
  });

  it('reports the permission reason ahead of live work', () => {
    expect(check('someone-else', { archiveBlocked: true })).toEqual({
      allowed: false,
      reasonKey: 'taskList.contextMenu.archiveDenied.notCreatorOrAdmin',
    });
  });

  it('puts the missing edit permission ahead of the role check', () => {
    mocks.canEdit = false;
    mocks.isAdmin = true;
    expect(check('me')).toEqual({
      allowed: false,
      reasonKey: 'taskList.contextMenu.archiveDenied.noEditPermission',
    });
  });
});
