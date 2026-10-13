import type { ProjectMemberRole } from '@lobechat/types';
import { and, asc, eq, ne } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import type { NewProjectSite, ProjectMemberItem } from '../schemas';
import { projectMembers, projectSites } from '../schemas';
import type { LobeChatDatabase } from '../type';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export type CreateProjectSiteInput = Pick<
  NewProjectSite,
  'acceptanceId' | 'createdByUserId' | 'name' | 'origins' | 'projectId' | 'workspaceId'
>;

export class ProjectSiteModel {
  constructor(private db: LobeChatDatabase) {}

  async create(input: CreateProjectSiteInput) {
    const [site] = await this.db.insert(projectSites).values(input).returning();
    return site;
  }

  async findById(id: string) {
    const [site] = await this.db
      .select()
      .from(projectSites)
      .where(eq(projectSites.id, id))
      .limit(1);
    return site ?? null;
  }

  async findBySiteKey(siteKey: string) {
    const [site] = await this.db
      .select()
      .from(projectSites)
      .where(eq(projectSites.siteKey, siteKey))
      .limit(1);
    return site ?? null;
  }

  listByProject(projectId: string) {
    return this.db
      .select()
      .from(projectSites)
      .where(eq(projectSites.projectId, projectId))
      .orderBy(asc(projectSites.createdAt));
  }

  async update(
    id: string,
    value: Partial<Pick<NewProjectSite, 'acceptanceId' | 'name' | 'origins'>>,
  ) {
    const [site] = await this.db
      .update(projectSites)
      .set({ ...value, updatedAt: new Date() })
      .where(eq(projectSites.id, id))
      .returning();
    return site ?? null;
  }

  async delete(id: string) {
    const [site] = await this.db.delete(projectSites).where(eq(projectSites.id, id)).returning();
    return site ?? null;
  }
}

export interface InviteProjectMemberInput {
  email: string;
  invitedByUserId?: string | null;
  projectId: string;
  role: ProjectMemberRole;
}

export type AcceptProjectInviteResult =
  | { member: ProjectMemberItem; ok: true }
  | { ok: false; reason: 'emailMismatch' | 'expired' | 'notFound' };

export class ProjectMemberModel {
  constructor(private db: LobeChatDatabase) {}

  async invite(input: InviteProjectMemberInput) {
    const email = normalizeEmail(input.email);
    const invite = {
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      inviteToken: nanoid(32),
      invitedByUserId: input.invitedByUserId ?? null,
      role: input.role,
    };

    const [existing] = await this.db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, input.projectId),
          eq(projectMembers.email, email),
          ne(projectMembers.status, 'revoked'),
        ),
      )
      .limit(1);

    if (existing?.status === 'accepted') return existing;
    if (existing) {
      const [refreshed] = await this.db
        .update(projectMembers)
        .set({ ...invite, updatedAt: new Date() })
        .where(eq(projectMembers.id, existing.id))
        .returning();
      return refreshed;
    }

    const [member] = await this.db
      .insert(projectMembers)
      .values({ ...invite, email, projectId: input.projectId, status: 'pending' })
      .returning();
    return member;
  }

  listByProject(projectId: string) {
    return this.db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), ne(projectMembers.status, 'revoked')))
      .orderBy(asc(projectMembers.createdAt));
  }

  async findById(id: string) {
    const [member] = await this.db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.id, id))
      .limit(1);
    return member ?? null;
  }

  async findByToken(token: string) {
    const [member] = await this.db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.inviteToken, token), eq(projectMembers.status, 'pending')))
      .limit(1);
    return member ?? null;
  }

  async findActive(projectId: string, userId: string) {
    const [member] = await this.db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId),
          eq(projectMembers.status, 'accepted'),
        ),
      )
      .limit(1);
    return member ?? null;
  }

  async accept(
    token: string,
    account: { email: string | null | undefined; userId: string },
  ): Promise<AcceptProjectInviteResult> {
    const invite = await this.findByToken(token);
    if (!invite) return { ok: false, reason: 'notFound' };
    if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
      return { ok: false, reason: 'expired' };
    }
    if (!account.email || normalizeEmail(account.email) !== invite.email) {
      return { ok: false, reason: 'emailMismatch' };
    }

    const [member] = await this.db
      .update(projectMembers)
      .set({
        acceptedAt: new Date(),
        inviteToken: null,
        status: 'accepted',
        updatedAt: new Date(),
        userId: account.userId,
      })
      .where(and(eq(projectMembers.id, invite.id), eq(projectMembers.status, 'pending')))
      .returning();
    return member ? { member, ok: true } : { ok: false, reason: 'notFound' };
  }

  async updateRole(id: string, role: ProjectMemberRole) {
    const [member] = await this.db
      .update(projectMembers)
      .set({ role, updatedAt: new Date() })
      .where(eq(projectMembers.id, id))
      .returning();
    return member ?? null;
  }

  async revoke(id: string) {
    const [member] = await this.db
      .update(projectMembers)
      .set({ inviteToken: null, status: 'revoked', updatedAt: new Date() })
      .where(eq(projectMembers.id, id))
      .returning();
    return member ?? null;
  }
}
