import { and, asc, count, eq, inArray, ne } from 'drizzle-orm';

import { type WorkspaceTeamItem, workspaceTeamMembers, workspaceTeams } from '../schemas/workspace';
import type { LobeChatDatabase } from '../type';

export interface WorkspaceTeamWithMemberCount extends WorkspaceTeamItem {
  memberCount: number;
}

export interface WorkspaceTeamMemberRow {
  createdAt: Date;
  role: string;
  userId: string;
}

/** Identifier for a workspace's default team when its name yields none (e.g. non-latin). */
export const DEFAULT_TEAM_IDENTIFIER = 'TEAM';

/**
 * Derive a team identifier from a name, Linear-style: initials of a
 * multi-word name ("Customer Support" → "CS"), otherwise the first three
 * characters ("Engineering" → "ENG"). Leading digits are dropped so the result
 * starts with a letter; returns '' when nothing usable remains.
 */
export const deriveTeamIdentifier = (name: string): string => {
  const words = name
    .toUpperCase()
    .split(/[^\dA-Z]+/)
    .filter(Boolean);
  if (words.length === 0) return '';

  const raw = words.length > 1 ? words.map((word) => word[0]).join('') : words[0].slice(0, 3);
  return raw.replace(/^\d+/, '').slice(0, 7);
};

/**
 * Data access for workspace teams. Every query is scoped to the workspace the
 * model was constructed with, so a team id from another workspace never
 * resolves — callers can pass client-provided ids straight through.
 */
export class WorkspaceTeamModel {
  private readonly db: LobeChatDatabase;
  private readonly workspaceId: string;

  constructor(db: LobeChatDatabase, workspaceId: string) {
    this.db = db;
    this.workspaceId = workspaceId;
  }

  // ===== Teams ===== //

  /** All teams of the workspace with their member counts, alphabetical. */
  list = async (): Promise<WorkspaceTeamWithMemberCount[]> => {
    const [teams, counts] = await Promise.all([
      this.db
        .select()
        .from(workspaceTeams)
        .where(eq(workspaceTeams.workspaceId, this.workspaceId))
        .orderBy(asc(workspaceTeams.name)),
      this.db
        .select({ memberCount: count(), teamId: workspaceTeamMembers.teamId })
        .from(workspaceTeamMembers)
        .where(eq(workspaceTeamMembers.workspaceId, this.workspaceId))
        .groupBy(workspaceTeamMembers.teamId),
    ]);

    const countMap = new Map(counts.map((row) => [row.teamId, Number(row.memberCount)]));
    return teams.map((team) => ({ ...team, memberCount: countMap.get(team.id) ?? 0 }));
  };

  findById = async (teamId: string): Promise<WorkspaceTeamItem | undefined> => {
    const [team] = await this.db
      .select()
      .from(workspaceTeams)
      .where(and(eq(workspaceTeams.workspaceId, this.workspaceId), eq(workspaceTeams.id, teamId)))
      .limit(1);
    return team;
  };

  findByIds = async (teamIds: string[]): Promise<WorkspaceTeamItem[]> => {
    if (teamIds.length === 0) return [];
    return this.db
      .select()
      .from(workspaceTeams)
      .where(
        and(eq(workspaceTeams.workspaceId, this.workspaceId), inArray(workspaceTeams.id, teamIds)),
      );
  };

  /** Whether `identifier` is already used by another team of this workspace. */
  isIdentifierTaken = async (identifier: string, excludeTeamId?: string): Promise<boolean> => {
    const [row] = await this.db
      .select({ id: workspaceTeams.id })
      .from(workspaceTeams)
      .where(
        and(
          eq(workspaceTeams.workspaceId, this.workspaceId),
          eq(workspaceTeams.identifier, identifier),
          excludeTeamId ? ne(workspaceTeams.id, excludeTeamId) : undefined,
        ),
      )
      .limit(1);
    return !!row;
  };

  create = async (params: {
    avatar?: string | null;
    createdBy: string;
    description?: string | null;
    identifier: string;
    memberUserIds?: string[];
    name: string;
  }): Promise<WorkspaceTeamItem> => {
    return this.db.transaction(async (tx) => {
      const [team] = await tx
        .insert(workspaceTeams)
        .values({
          avatar: params.avatar ?? null,
          createdBy: params.createdBy,
          description: params.description ?? null,
          identifier: params.identifier,
          name: params.name,
          workspaceId: this.workspaceId,
        })
        .returning();

      const userIds = [...new Set(params.memberUserIds ?? [])];
      if (userIds.length > 0) {
        await tx
          .insert(workspaceTeamMembers)
          .values(
            userIds.map((userId) => ({ teamId: team.id, userId, workspaceId: this.workspaceId })),
          )
          .onConflictDoNothing();
      }

      return team;
    });
  };

  update = async (
    teamId: string,
    params: {
      avatar?: string | null;
      description?: string | null;
      identifier?: string;
      name?: string;
    },
  ): Promise<WorkspaceTeamItem | undefined> => {
    const [team] = await this.db
      .update(workspaceTeams)
      .set({
        ...(params.avatar === undefined ? {} : { avatar: params.avatar }),
        ...(params.description === undefined ? {} : { description: params.description }),
        ...(params.identifier === undefined ? {} : { identifier: params.identifier }),
        ...(params.name === undefined ? {} : { name: params.name }),
        updatedAt: new Date(),
      })
      .where(and(eq(workspaceTeams.workspaceId, this.workspaceId), eq(workspaceTeams.id, teamId)))
      .returning();
    return team;
  };

  /** Membership rows cascade with the team row. */
  delete = async (teamId: string): Promise<WorkspaceTeamItem | undefined> => {
    const [team] = await this.db
      .delete(workspaceTeams)
      .where(and(eq(workspaceTeams.workspaceId, this.workspaceId), eq(workspaceTeams.id, teamId)))
      .returning();
    return team;
  };

  // ===== Members ===== //

  listMembers = async (teamId: string): Promise<WorkspaceTeamMemberRow[]> => {
    return this.db
      .select({
        createdAt: workspaceTeamMembers.createdAt,
        role: workspaceTeamMembers.role,
        userId: workspaceTeamMembers.userId,
      })
      .from(workspaceTeamMembers)
      .where(
        and(
          eq(workspaceTeamMembers.workspaceId, this.workspaceId),
          eq(workspaceTeamMembers.teamId, teamId),
        ),
      )
      .orderBy(asc(workspaceTeamMembers.createdAt));
  };

  listMemberUserIds = async (teamId: string): Promise<string[]> => {
    const rows = await this.listMembers(teamId);
    return rows.map((row) => row.userId);
  };

  /** Idempotent: users already in the team are skipped. Returns the newly added ids. */
  addMembers = async (teamId: string, userIds: string[]): Promise<string[]> => {
    const uniqueIds = [...new Set(userIds)];
    if (uniqueIds.length === 0) return [];

    const inserted = await this.db
      .insert(workspaceTeamMembers)
      .values(uniqueIds.map((userId) => ({ teamId, userId, workspaceId: this.workspaceId })))
      .onConflictDoNothing()
      .returning({ userId: workspaceTeamMembers.userId });
    return inserted.map((row) => row.userId);
  };

  removeMember = async (teamId: string, userId: string): Promise<boolean> => {
    const deleted = await this.db
      .delete(workspaceTeamMembers)
      .where(
        and(
          eq(workspaceTeamMembers.workspaceId, this.workspaceId),
          eq(workspaceTeamMembers.teamId, teamId),
          eq(workspaceTeamMembers.userId, userId),
        ),
      )
      .returning({ id: workspaceTeamMembers.id });
    return deleted.length > 0;
  };
}
