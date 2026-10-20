// @vitest-environment node
import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  assertCanPerformResourceAction: vi.fn(),
  getWorkspaceScopedPermissionMatches: vi.fn(),
  modelArgs: [] as unknown[][],
  model: {
    addAgent: vi.fn(),
    addKnowledgeBase: vi.fn(),
    findByIdOrSlug: vi.fn(),
    listAgents: vi.fn(),
    listCompletionReviews: vi.fn(),
    listKnowledgeBases: vi.fn(),
    listTasks: vi.fn(),
    listWorks: vi.fn(),
    removeAgent: vi.fn(),
    resolveCoordinatorAgents: vi.fn(async (items: unknown[]) => items),
    updateAgent: vi.fn(),
    updateKnowledgeBase: vi.fn(),
  },
}));

vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: vi.fn(function () {
    return {};
  }),
}));

vi.mock('@/business/server/trpc-middlewares/rbacPermission', () => ({
  withScopedPermission: vi.fn(function () {
    return (opts: any) => opts.next({ ctx: opts.ctx });
  }),
}));

vi.mock('@/database/models/project', () => ({
  ProjectModel: vi.fn(function (...args: unknown[]) {
    mocks.modelArgs.push(args);
    return mocks.model;
  }),
}));

vi.mock('@/server/services/resourcePermission', () => ({
  assertCanPerformResourceAction: mocks.assertCanPerformResourceAction,
}));

vi.mock('@/server/services/workspacePermission', () => ({
  getWorkspaceScopedPermissionMatches: mocks.getWorkspaceScopedPermissionMatches,
}));

const { projectRouter } = await import('../project');

const workspaceCaller = (userId = 'user-1') =>
  projectRouter.createCaller({ userId, workspaceId: 'ws-1' } as never);
const personalCaller = () =>
  projectRouter.createCaller({ userId: 'user-1', workspaceId: null } as never);

const lastModelOptions = () => mocks.modelArgs.at(-1)?.[3];

describe('projectRouter bindings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.modelArgs.length = 0;
    mocks.getWorkspaceScopedPermissionMatches.mockResolvedValue({
      hasAllScope: false,
      hasOwnerScope: true,
    });
    mocks.assertCanPerformResourceAction.mockResolvedValue(undefined);
    mocks.model.addAgent.mockResolvedValue({ id: 'binding-1' });
    mocks.model.removeAgent.mockResolvedValue(true);
    mocks.model.addKnowledgeBase.mockResolvedValue({ id: 'binding-2' });
    mocks.model.updateAgent.mockResolvedValue({ id: 'binding-1', role: 'lead' });
    mocks.model.updateKnowledgeBase.mockResolvedValue({ enabled: false, id: 'binding-2' });
    mocks.model.findByIdOrSlug.mockResolvedValue({ id: 'project-1', userId: 'creator' });
    for (const list of [
      mocks.model.listAgents,
      mocks.model.listCompletionReviews,
      mocks.model.listKnowledgeBases,
      mocks.model.listTasks,
      mocks.model.listWorks,
    ]) {
      list.mockResolvedValue([]);
    }
  });

  it('requires use access on the agent before inviting it', async () => {
    mocks.assertCanPerformResourceAction.mockRejectedValue(
      new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to use this resource',
      }),
    );

    await expect(
      workspaceCaller().addAgent({ agentId: 'agent-1', id: 'project-1' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    expect(mocks.assertCanPerformResourceAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'use',
        resourceId: 'agent-1',
        resourceType: 'agent',
        userId: 'user-1',
        workspaceId: 'ws-1',
      }),
    );
    expect(mocks.model.addAgent).not.toHaveBeenCalled();
  });

  it('requires use access on the knowledge base before linking it', async () => {
    await expect(
      workspaceCaller().addKnowledgeBase({ id: 'project-1', knowledgeBaseId: 'kb-1' }),
    ).resolves.toMatchObject({ success: true });

    expect(mocks.assertCanPerformResourceAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'use', resourceId: 'kb-1', resourceType: 'knowledgeBase' }),
    );
    expect(mocks.model.addKnowledgeBase).toHaveBeenCalledWith('project-1', {
      knowledgeBaseId: 'kb-1',
    });
  });

  it('skips resource checks in personal mode, where only owned rows are reachable', async () => {
    await personalCaller().addAgent({ agentId: 'agent-1', id: 'project-1' });

    expect(mocks.assertCanPerformResourceAction).not.toHaveBeenCalled();
    expect(mocks.getWorkspaceScopedPermissionMatches).not.toHaveBeenCalled();
    expect(lastModelOptions()).toEqual({ isWorkspaceAdmin: false });
  });

  it('opens member management to workspace admins only', async () => {
    await workspaceCaller().updateAgent({ agentId: 'agent-1', id: 'project-1', role: 'lead' });
    expect(lastModelOptions()).toEqual({ isWorkspaceAdmin: false });
    expect(mocks.model.updateAgent).toHaveBeenCalledWith('project-1', 'agent-1', { role: 'lead' });

    mocks.getWorkspaceScopedPermissionMatches.mockResolvedValue({
      hasAllScope: true,
      hasOwnerScope: false,
    });
    await workspaceCaller('admin-1').removeAgent({ agentId: 'agent-1', id: 'project-1' });
    expect(mocks.getWorkspaceScopedPermissionMatches).toHaveBeenLastCalledWith(
      expect.objectContaining({ action: 'AGENT_UPDATE', userId: 'admin-1', workspaceId: 'ws-1' }),
    );
    expect(lastModelOptions()).toEqual({ isWorkspaceAdmin: true });
  });

  it('reports a missing binding on update as not found', async () => {
    mocks.model.updateKnowledgeBase.mockResolvedValue(null);

    await expect(
      workspaceCaller().updateKnowledgeBase({
        enabled: false,
        id: 'project-1',
        knowledgeBaseId: 'kb-1',
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', message: 'Binding not found' });
  });

  it('returns what the caller may change alongside the project detail', async () => {
    await expect(workspaceCaller().detail({ id: 'project-1' })).resolves.toMatchObject({
      data: {
        permissions: { canManage: false, canManageKnowledgeBases: true, canManageMembers: false },
      },
    });

    mocks.getWorkspaceScopedPermissionMatches.mockResolvedValue({
      hasAllScope: true,
      hasOwnerScope: false,
    });
    await expect(workspaceCaller().detail({ id: 'project-1' })).resolves.toMatchObject({
      data: {
        permissions: { canManage: false, canManageKnowledgeBases: true, canManageMembers: true },
      },
    });

    mocks.getWorkspaceScopedPermissionMatches.mockResolvedValue({
      hasAllScope: false,
      hasOwnerScope: false,
    });
    await expect(workspaceCaller('creator').detail({ id: 'project-1' })).resolves.toMatchObject({
      data: {
        permissions: { canManage: false, canManageKnowledgeBases: false, canManageMembers: false },
      },
    });

    await expect(personalCaller().detail({ id: 'project-1' })).resolves.toMatchObject({
      data: {
        permissions: { canManage: false, canManageKnowledgeBases: true, canManageMembers: false },
      },
    });
  });
});
