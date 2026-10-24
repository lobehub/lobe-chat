import { createHash } from 'node:crypto';

import type {
  LinearIssueLinkMetadata,
  LinearIssuePage,
  LinearIssueStateType,
  LinearSyncResult,
  LinearSyncSkipReason,
  TaskItem,
} from '@lobechat/types';
import debug from 'debug';

import { isTaskIdentifierUniqueViolation, TaskModel } from '@/database/models/task';
import {
  TaskExternalLinkModel,
  type TaskExternalLinkWithTask,
} from '@/database/models/taskExternalLink';
import type { LobeChatDatabase } from '@/database/type';

import { TaskService } from '../task';
import {
  getLinearIssuesByIds,
  LINEAR_PAGE_SIZE,
  type LinearIssue,
  type LinearIssueFilter,
  listLinearIssues,
} from './issues';

const log = debug('lobe-server:linear:issue-sync');

/** Safety bound on the issues one filtered sync reads (200 pages). */
export const MAX_ISSUES_PER_SYNC = 10_000;
/**
 * Tasks one sync creates. Already linked issues are still checked, so running
 * the sync again picks up where the previous run stopped.
 */
export const MAX_TASKS_CREATED_PER_SYNC = 100;
/** Skipped entries kept in a result, so a stored rule result stays small. */
const MAX_SKIPPED_ENTRIES = 100;

const CLOSED_STATE_TYPES = new Set<LinearIssueStateType>(['completed', 'canceled']);
const CLOSED_TASK_STATUSES = new Set(['completed', 'canceled']);

/** The task fields a sync owns. */
interface SyncedFields {
  instruction: string;
  name: string;
  priority: number;
}

interface SyncOptions {
  /**
   * Only close tasks whose issue Linear closed; never create or rewrite. Used
   * for linked issues that a filtered sync no longer matches.
   */
  closeOnly?: boolean;
  /** Import an issue that is already completed or canceled (as a closed task). */
  createClosed?: boolean;
  /** LobeHub project new tasks land in. */
  targetProjectId?: string | null;
}

export const linearIssueToTaskFields = (issue: LinearIssue): SyncedFields => {
  const source = `> Linear: [${issue.identifier}](${issue.url})`;
  const body = issue.description?.trim() || issue.title;
  return {
    instruction: `${source}\n\n${body}`,
    name: issue.title,
    // Both sides use 0 none, 1 urgent, 2 high, 3 normal (Linear: medium), 4 low.
    priority: issue.priority,
  };
};

export const hashSyncedFields = (fields: SyncedFields): string =>
  createHash('sha256')
    .update(JSON.stringify([fields.name, fields.instruction, fields.priority]))
    .digest('hex');

const hashTask = (task: TaskItem): string =>
  hashSyncedFields({
    instruction: task.instruction,
    name: task.name ?? '',
    priority: task.priority ?? 0,
  });

const linkMetadata = (issue: LinearIssue): LinearIssueLinkMetadata => ({
  assigneeName: issue.assignee?.displayName,
  labels: issue.labels?.nodes.map((label) => label.name),
  projectName: issue.project?.name,
  stateName: issue.state.name,
  stateType: issue.state.type,
  teamKey: issue.team.key,
});

const emptyResult = (): LinearSyncResult => ({
  closed: 0,
  created: 0,
  keptLocalEdits: 0,
  skipped: [],
  truncated: false,
  unchanged: 0,
  updated: 0,
});

/** Parents before their children, so a child can attach to a task created in the same run. */
const parentsFirst = (issues: LinearIssue[]): LinearIssue[] => {
  const ids = new Set(issues.map((issue) => issue.id));
  const ordered: LinearIssue[] = [];
  const placed = new Set<string>();
  let pending = issues;
  while (pending.length > 0) {
    const ready = pending.filter(
      (issue) => !issue.parent || !ids.has(issue.parent.id) || placed.has(issue.parent.id),
    );
    // A cycle cannot happen in Linear; guard anyway so the loop always ends.
    const batch = ready.length > 0 ? ready : pending;
    for (const issue of batch) {
      ordered.push(issue);
      placed.add(issue.id);
    }
    pending = pending.filter((issue) => !placed.has(issue.id));
  }
  return ordered;
};

/**
 * One-way Linear → task sync for a scope (a workspace or a user's personal
 * space). Linear is only read. An issue maps to one task per scope through
 * `task_external_links`, so syncing again updates that task:
 *
 * - name, instruction and priority follow Linear unless the task was edited
 *   in LobeHub since the last sync, in which case the edit is kept;
 * - a task whose issue Linear completed or canceled is closed the same way,
 *   except a running task, which is never interrupted;
 * - a task is never reopened, deleted or recreated by a sync.
 */
export class LinearIssueSyncService {
  private readonly linkModel: TaskExternalLinkModel;
  private readonly taskModel: TaskModel;
  private readonly taskService: TaskService;
  private readonly userId: string;

  constructor(db: LobeChatDatabase, userId: string, workspaceId?: string) {
    this.userId = userId;
    this.linkModel = new TaskExternalLinkModel(db, userId, workspaceId);
    this.taskModel = new TaskModel(db, userId, workspaceId);
    this.taskService = new TaskService(db, userId, workspaceId);
  }

  /** A page of issues for the import picker, marking the ones already imported. */
  async listIssues(
    accessToken: string,
    filter: LinearIssueFilter,
    after?: string,
  ): Promise<LinearIssuePage> {
    const page = await listLinearIssues(accessToken, filter, { after });
    const links = await this.visibleLinks(page.issues.map((issue) => issue.id));

    return {
      cursor: page.cursor,
      hasMore: page.hasMore,
      issues: page.issues.map((issue) => ({
        assigneeName: issue.assignee?.displayName,
        id: issue.id,
        identifier: issue.identifier,
        linkedTaskIdentifier: links.get(issue.id)?.taskIdentifier,
        priority: issue.priority,
        projectName: issue.project?.name,
        stateName: issue.state.name,
        stateType: issue.state.type,
        title: issue.title,
        updatedAt: issue.updatedAt,
        url: issue.url,
      })),
    };
  }

  /** Import the issues the user picked, whatever their state. */
  async importIssues(
    accessToken: string,
    issueIds: string[],
    options: { targetProjectId?: string | null } = {},
  ): Promise<LinearSyncResult> {
    const issues = await getLinearIssuesByIds(accessToken, issueIds);
    const result = emptyResult();
    await this.syncIssues(
      issues,
      { createClosed: true, targetProjectId: options.targetProjectId },
      result,
    );
    return result;
  }

  /**
   * Sync every issue matching a filter, then close the tasks of linked issues
   * in the same team that the filter no longer matches because Linear closed
   * them.
   */
  async syncByFilter(
    accessToken: string,
    filter: LinearIssueFilter,
    options: { targetProjectId?: string | null } = {},
  ): Promise<LinearSyncResult> {
    const result = emptyResult();
    const issues: LinearIssue[] = [];
    // Read until this run has as many not-yet-imported issues as it may create.
    // Already linked issues do not count, so the next run reaches further.
    let unlinked = 0;
    let after: string | undefined;
    do {
      const page = await listLinearIssues(accessToken, filter, {
        after,
        first: Math.min(LINEAR_PAGE_SIZE, MAX_ISSUES_PER_SYNC - issues.length),
      });
      issues.push(...page.issues);
      after = page.cursor;
      const linked = await this.linkModel.findByExternalIds(
        'linear',
        page.issues.map((issue) => issue.id),
      );
      unlinked += page.issues.length - linked.length;
    } while (after && issues.length < MAX_ISSUES_PER_SYNC && unlinked < MAX_TASKS_CREATED_PER_SYNC);
    result.truncated = !!after;

    await this.syncIssues(
      issues,
      {
        createClosed: filter.stateTypes.some((type) => CLOSED_STATE_TYPES.has(type)),
        targetProjectId: options.targetProjectId,
      },
      result,
    );

    // Linked issues the filter missed: closed since, or moved out of the project.
    const seen = new Set(issues.map((issue) => issue.id));
    const unseen = (await this.linkModel.findByContainer('linear', filter.teamId)).filter(
      (link) => !seen.has(link.externalId),
    );
    if (unseen.length > 0) {
      const open = await this.taskModel.findByIds(unseen.map((link) => link.taskId));
      const openTaskIds = new Set(
        open.filter((task) => !CLOSED_TASK_STATUSES.has(task.status)).map((task) => task.id),
      );
      const toCheck = unseen.filter((link) => openTaskIds.has(link.taskId));
      if (toCheck.length > 0) {
        const fetched = await getLinearIssuesByIds(
          accessToken,
          toCheck.map((link) => link.externalId),
        );
        await this.syncIssues(fetched, { closeOnly: true }, result);
      }
    }

    return result;
  }

  private async syncIssues(
    issues: LinearIssue[],
    options: SyncOptions,
    result: LinearSyncResult,
  ): Promise<void> {
    if (issues.length === 0) return;

    const parentIds = issues.flatMap((issue) => (issue.parent ? [issue.parent.id] : []));
    // Every link in scope, visible or not: an issue whose task is trashed or
    // private to someone else is still taken, and is reported, not re-created.
    const links = new Map(
      (
        await this.linkModel.findByExternalIds('linear', [
          ...new Set([...issues.map((issue) => issue.id), ...parentIds]),
        ])
      ).map((link) => [link.externalId, link]),
    );
    const tasks = new Map(
      (await this.taskModel.findByIds([...links.values()].map((link) => link.taskId))).map(
        (task) => [task.id, task],
      ),
    );

    for (const issue of parentsFirst(issues)) {
      try {
        const link = links.get(issue.id);
        if (link) {
          await this.syncLinked(issue, link, tasks.get(link.taskId), options, result);
        } else if (!options.closeOnly) {
          const created = await this.create(issue, links, tasks, options, result);
          if (created) {
            links.set(issue.id, created.link);
            tasks.set(created.task.id, created.task);
          }
        }
      } catch (error) {
        log('sync %s failed: %O', issue.identifier, error);
        skip(result, issue.identifier, 'failed');
      }
    }
  }

  private async create(
    issue: LinearIssue,
    links: Map<string, TaskExternalLinkWithTask>,
    tasks: Map<string, TaskItem>,
    options: SyncOptions,
    result: LinearSyncResult,
  ): Promise<{ link: TaskExternalLinkWithTask; task: TaskItem } | undefined> {
    const closed = CLOSED_STATE_TYPES.has(issue.state.type);
    if (closed && !options.createClosed) {
      skip(result, issue.identifier, 'closed');
      return;
    }
    if (result.created >= MAX_TASKS_CREATED_PER_SYNC) {
      result.truncated = true;
      return;
    }

    const fields = linearIssueToTaskFields(issue);
    const targetProjectId = options.targetProjectId ?? null;
    // A subtask must share its parent's project, so attach only when it does.
    const parentLink = issue.parent ? links.get(issue.parent.id) : undefined;
    const parentTask = parentLink ? tasks.get(parentLink.taskId) : undefined;
    const parentTaskId =
      parentTask && (parentTask.projectId ?? null) === targetProjectId ? parentTask.id : undefined;

    const task = await this.taskService.createTask({
      ...fields,
      parentTaskId,
      projectId: targetProjectId ?? undefined,
    });

    let linkRow;
    try {
      linkRow = await this.linkModel.create({
        externalContainerId: issue.team.id,
        externalId: issue.id,
        externalIdentifier: issue.identifier,
        externalUpdatedAt: new Date(issue.updatedAt),
        externalUrl: issue.url,
        metadata: linkMetadata(issue),
        provider: 'linear',
        syncedHash: hashSyncedFields(fields),
        taskId: task.id,
      });
    } catch (error) {
      // A concurrent sync linked the issue first; keep its task, drop ours.
      await this.taskModel.delete(task.id);
      if (isTaskIdentifierUniqueViolation(error)) {
        result.unchanged += 1;
        return;
      }
      throw error;
    }

    let current = task;
    if (closed) current = await this.close(task, issue.state.type);
    result.created += 1;
    return { link: { ...linkRow, taskIdentifier: task.identifier }, task: current };
  }

  private async syncLinked(
    issue: LinearIssue,
    link: TaskExternalLinkWithTask,
    task: TaskItem | undefined,
    options: SyncOptions,
    result: LinearSyncResult,
  ): Promise<void> {
    if (!task) {
      skip(result, issue.identifier, 'unavailable');
      return;
    }

    // Every issue lands in exactly one bucket besides `closed`: updated, kept
    // local edits, skipped, or unchanged.
    let counted = false;
    let syncedHash = link.syncedHash;
    if (!options.closeOnly) {
      const fields = linearIssueToTaskFields(issue);
      const nextHash = hashSyncedFields(fields);
      if (hashTask(task) !== link.syncedHash) {
        result.keptLocalEdits += 1;
        counted = true;
      } else if (nextHash !== link.syncedHash) {
        await this.taskService.updateTaskWithAssigneeLock(task.id, fields, {
          userId: this.userId,
        });
        syncedHash = nextHash;
        result.updated += 1;
        counted = true;
      }
    }

    if (CLOSED_STATE_TYPES.has(issue.state.type) && !CLOSED_TASK_STATUSES.has(task.status)) {
      if (task.status === 'running') {
        skip(result, issue.identifier, 'running');
      } else {
        await this.close(task, issue.state.type);
        result.closed += 1;
      }
      counted = true;
    }

    if (!counted) result.unchanged += 1;

    // Nothing moved on either side: leave the link row alone.
    const issueUpdatedAt = new Date(issue.updatedAt);
    if (
      syncedHash === link.syncedHash &&
      link.externalUpdatedAt?.getTime() === issueUpdatedAt.getTime()
    ) {
      return;
    }

    await this.linkModel.update(link.id, {
      externalContainerId: issue.team.id,
      externalIdentifier: issue.identifier,
      externalUpdatedAt: issueUpdatedAt,
      externalUrl: issue.url,
      metadata: linkMetadata(issue),
      syncedHash,
    });
  }

  private async close(task: TaskItem, stateType: LinearIssueStateType): Promise<TaskItem> {
    const { task: updated } = await this.taskService.updateStatus(
      { id: task.id, status: stateType === 'completed' ? 'completed' : 'canceled' },
      { userId: this.userId },
    );
    return updated;
  }

  /** Links in this scope whose task the caller can still see. */
  private async visibleLinks(externalIds: string[]) {
    const links = await this.linkModel.findByExternalIds('linear', [...new Set(externalIds)]);
    const visible = new Set(
      (await this.taskModel.findByIds(links.map((link) => link.taskId))).map((task) => task.id),
    );
    return new Map(
      links.filter((link) => visible.has(link.taskId)).map((link) => [link.externalId, link]),
    );
  }
}

const skip = (result: LinearSyncResult, identifier: string, reason: LinearSyncSkipReason) => {
  if (result.skipped.length < MAX_SKIPPED_ENTRIES) result.skipped.push({ identifier, reason });
};
