import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { getActiveWorkspaceId } from '@/business/client/hooks/useActiveWorkspaceId';
import {
  arrayEntity,
  createReplicaSlice,
  createReplicaState,
  linkReplicaEntity,
  recordLens,
  type ReplicaState,
  type ReplicaSyncResult,
  singleEntity,
} from '@/libs/replica';
import {
  type ProjectAgentBindingPatch,
  type ProjectKnowledgeBaseBindingPatch,
  projectService,
} from '@/services/project';
import { createDevtools } from '@/store/middleware/createDevtools';
import { expose } from '@/store/middleware/expose';
import { useProjectDirectoryStore } from '@/store/projectWorkingDirectory';

import {
  PROJECT_LIST_KEY,
  type ProjectDetail,
  projectDetailResource,
  type ProjectListItem,
  projectListResource,
} from './projection';

export type { ProjectDetail, ProjectListItem } from './projection';

export interface ProjectStoreState {
  /** Project pages by route param (id or slug). */
  projectDetailMap: Record<string, ProjectDetail>;
  /** Replica bookkeeping for `projectDetailMap`. */
  projectDetailReplica: ReplicaState<ProjectDetail>;
  /** `projectListMap.all`: every project of the active scope. */
  projectListMap: Record<string, ProjectListItem[]>;
  /** Replica bookkeeping for `projectListMap`. */
  projectListReplica: ReplicaState<ProjectListItem[]>;
}

interface ProjectStore extends ProjectStoreState {
  /** Invite agents; one refetch after the batch so every loaded page shows them. */
  addProjectAgents: (projectId: string, agentIds: string[]) => Promise<void>;
  addProjectKnowledgeBases: (projectId: string, knowledgeBaseIds: string[]) => Promise<void>;
  createProject: (input: {
    identifier: string;
    name: string;
    slug?: string;
  }) => Promise<ProjectListItem>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjectList: () => Promise<void>;
  removeProjectAgent: (projectId: string, agentId: string) => Promise<void>;
  removeProjectKnowledgeBase: (projectId: string, knowledgeBaseId: string) => Promise<void>;
  /** Make another agent the main agent; a dedicated coordinator hands over its history and goes. */
  replaceProjectCoordinator: (projectId: string, agentId: string) => Promise<void>;
  updateProject: (
    id: string,
    input: Parameters<typeof projectService.update>[1],
  ) => Promise<ProjectListItem>;
  updateProjectAgent: (
    projectId: string,
    agentId: string,
    patch: ProjectAgentBindingPatch,
  ) => Promise<void>;
  updateProjectKnowledgeBase: (
    projectId: string,
    knowledgeBaseId: string,
    patch: ProjectKnowledgeBaseBindingPatch,
  ) => Promise<void>;
  /** Fetch orchestration only; read the value with `useCurrentProjectDetail`. */
  useFetchProjectDetail: (idOrSlug?: string) => ReplicaSyncResult;
  /** Fetch orchestration only; read the rows with `useCurrentProjectList`. */
  useFetchProjectList: (enabled?: boolean) => ReplicaSyncResult;
}

export const initialProjectState: ProjectStoreState = {
  projectDetailMap: {},
  projectDetailReplica: createReplicaState(),
  projectListMap: {},
  projectListReplica: createReplicaState(),
};

const LIST_PARAMS = {} as Record<string, never>;

const devtools = createDevtools('project');

export const useProjectStore = createWithEqualityFn<ProjectStore>()(
  devtools((set, get) => {
    const list = createReplicaSlice(projectListResource, {
      actionPrefix: 'project/list',
      entity: arrayEntity<ProjectListItem>((project) => project.id),
      fetcher: () => projectService.listAll(),
      get,
      merge: (response) => response.data,
      set,
      stateKey: 'projectListReplica',
      view: recordLens<ProjectStore, ProjectListItem[]>('projectListMap'),
    });
    const detail = createReplicaSlice(projectDetailResource, {
      actionPrefix: 'project/detail',
      entity: singleEntity<ProjectDetail, ProjectListItem>((project) => project.id, {
        get: (value) => value.project,
        set: (value, project) => ({ ...value, project }),
      }),
      fetcher: (idOrSlug) => projectService.detail(idOrSlug),
      get,
      merge: (response) => response.data,
      set,
      stateKey: 'projectDetailReplica',
      view: recordLens<ProjectStore, ProjectDetail>('projectDetailMap'),
    });
    // The same project lives in the list and in every loaded project page.
    const projectEntity = linkReplicaEntity<ProjectListItem>([list, detail]);

    const refreshList = () => list.revalidate(PROJECT_LIST_KEY);

    // A project page is keyed by its route param, so one project can sit under
    // both its id and its slug.
    const detailKeysOf = (projectId: string) =>
      Object.entries(get().projectDetailMap)
        .filter(([, value]) => value?.project.id === projectId)
        .map(([key]) => key);
    const refreshDetail = async (projectId: string) => {
      await Promise.all(detailKeysOf(projectId).map((key) => detail.fetch(key, { fresh: true })));
    };
    /** Patch every loaded page now; the refetch afterwards reconciles server-owned fields. */
    const patchDetail = (projectId: string, patch: (value: ProjectDetail) => ProjectDetail) => {
      for (const key of detailKeysOf(projectId)) {
        detail.update(key, (value) => (value ? patch(value) : value));
      }
    };
    const mutateAndRefresh = async (projectId: string, mutation: () => Promise<unknown>) => {
      try {
        await mutation();
      } finally {
        await refreshDetail(projectId);
      }
    };

    return {
      ...initialProjectState,
      addProjectAgents: async (projectId, agentIds) => {
        await mutateAndRefresh(projectId, () =>
          Promise.all(agentIds.map((agentId) => projectService.addAgent(projectId, agentId))),
        );
      },
      addProjectKnowledgeBases: async (projectId, knowledgeBaseIds) => {
        await mutateAndRefresh(projectId, () =>
          Promise.all(
            knowledgeBaseIds.map((knowledgeBaseId) =>
              projectService.addKnowledgeBase(projectId, knowledgeBaseId),
            ),
          ),
        );
      },
      createProject: async (input) => {
        const response = await projectService.create(input, getActiveWorkspaceId());
        const project = response.data;
        list.update(PROJECT_LIST_KEY, (items) =>
          items && !items.some((item) => item.id === project.id) ? [project, ...items] : items,
        );
        void refreshList();
        return project;
      },
      deleteProject: async (id) => {
        await projectService.delete(id);
        projectEntity.remove(id);
        void refreshList();
      },
      refreshProjectList: async () => {
        await refreshList();
      },
      removeProjectAgent: async (projectId, agentId) => {
        patchDetail(projectId, (value) => ({
          ...value,
          agents: value.agents?.filter(({ agent }) => agent.id !== agentId) ?? value.agents,
        }));
        await mutateAndRefresh(projectId, () => projectService.removeAgent(projectId, agentId));
      },
      removeProjectKnowledgeBase: async (projectId, knowledgeBaseId) => {
        patchDetail(projectId, (value) => ({
          ...value,
          knowledgeBases:
            value.knowledgeBases?.filter(
              ({ knowledgeBase }) => knowledgeBase.id !== knowledgeBaseId,
            ) ?? value.knowledgeBases,
        }));
        await mutateAndRefresh(projectId, () =>
          projectService.removeKnowledgeBase(projectId, knowledgeBaseId),
        );
      },
      replaceProjectCoordinator: async (projectId, agentId) => {
        await mutateAndRefresh(projectId, () =>
          projectService.replaceCoordinator(projectId, agentId),
        );
        // The handed-over conversations now group under the new main agent.
        void useProjectDirectoryStore.getState().refreshProjectTopics(projectId);
        void refreshList();
      },
      updateProjectAgent: async (projectId, agentId, patch) => {
        patchDetail(projectId, (value) => ({
          ...value,
          agents:
            value.agents?.map((item) =>
              item.agent.id === agentId
                ? { ...item, binding: { ...item.binding, ...patch } }
                : item,
            ) ?? value.agents,
        }));
        await mutateAndRefresh(projectId, () =>
          projectService.updateAgent(projectId, agentId, patch),
        );
      },
      updateProjectKnowledgeBase: async (projectId, knowledgeBaseId, patch) => {
        patchDetail(projectId, (value) => ({
          ...value,
          knowledgeBases:
            value.knowledgeBases?.map((item) =>
              item.knowledgeBase.id === knowledgeBaseId
                ? { ...item, binding: { ...item.binding, ...patch } }
                : item,
            ) ?? value.knowledgeBases,
        }));
        await mutateAndRefresh(projectId, () =>
          projectService.updateKnowledgeBase(projectId, knowledgeBaseId, patch),
        );
      },
      updateProject: async (id, input) => {
        const response = await projectEntity.optimistic(
          id,
          (project) => ({ ...project, ...input }),
          () => projectService.update(id, input),
        );
        // Server-owned fields (updatedAt, slug normalisation) land in every copy.
        projectEntity.update(id, (project) => ({ ...project, ...response.data }));
        void refreshList();
        return response.data;
      },
      useFetchProjectDetail: (idOrSlug) => detail.useSync(idOrSlug || null),
      useFetchProjectList: (enabled = true) => list.useSync(LIST_PARAMS, { enabled }),
    };
  }),
  shallow,
);

expose('project', useProjectStore);

const EMPTY_PROJECTS: ProjectListItem[] = [];

export const useCurrentProjectList = () =>
  useProjectStore((state) => state.projectListMap[PROJECT_LIST_KEY] ?? EMPTY_PROJECTS);

/**
 * Every project of the active scope, or `undefined` until the list first loads
 * — for callers that must tell "not loaded" from "no projects".
 */
export const useLoadedProjectList = () =>
  useProjectStore((state): ProjectListItem[] | undefined => state.projectListMap[PROJECT_LIST_KEY]);

export const useCurrentProjectDetail = (idOrSlug?: string) =>
  useProjectStore((state) => (idOrSlug ? state.projectDetailMap[idOrSlug] : undefined));
