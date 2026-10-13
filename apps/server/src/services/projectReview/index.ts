import type { ProjectMemberRole } from '@lobechat/types';
import { normalizeSiteOrigin } from '@lobechat/utils/siteOrigin';
import { TRPCError } from '@trpc/server';
import debug from 'debug';
import { and, eq, inArray } from 'drizzle-orm';

import { ProjectMemberModel, ProjectSiteModel } from '@/database/models/projectReview';
import {
  acceptances,
  projects,
  projectSites,
  users,
  verifyRuns,
  workspaceMembers,
} from '@/database/schemas';
import type { LobeChatDatabase } from '@/database/type';
import { appEnv } from '@/envs/app';
import {
  canManageProjectReview,
  findProjectReviewScope,
  type ProjectReviewScope,
} from '@/server/services/acceptanceReview/projectAccess';
import { EmailService } from '@/server/services/email';

const log = debug('lobe-server:project-review');

const siteReviewTitle = (name: string) => `Site review · ${name}`;

const escapeHtml = (value: string) =>
  value.replaceAll(/["&'<>]/g, (char) => `&#${char.charCodeAt(0)};`);

export interface SiteInput {
  name: string;
  origins: string[];
}

export type ProjectInviteView =
  | { status: 'expired' | 'notFound' }
  | {
      email: string;
      emailMatches: boolean;
      inviterName: string | null;
      projectName: string;
      role: ProjectMemberRole;
      status: 'valid';
    };

export class ProjectReviewService {
  private sites: ProjectSiteModel;
  private members: ProjectMemberModel;

  constructor(
    private db: LobeChatDatabase,
    private userId: string,
  ) {
    this.sites = new ProjectSiteModel(db);
    this.members = new ProjectMemberModel(db);
  }

  async listSites(projectId: string) {
    await this.assertManager(projectId);
    return this.sites.listByProject(projectId);
  }

  async createSite(projectId: string, input: SiteInput) {
    const project = await this.assertManager(projectId);
    const origins = this.normalizeOrigins(input.origins);
    const name = input.name.trim();
    const previewUrl = origins.find((origin) => !origin.includes('://*.'));

    return this.db.transaction(async (tx) => {
      const [site] = await tx
        .insert(projectSites)
        .values({
          createdByUserId: this.userId,
          name,
          origins,
          projectId,
          workspaceId: project.workspaceId,
        })
        .returning();
      const [acceptance] = await tx
        .insert(acceptances)
        .values({
          metadata: { title: siteReviewTitle(name) },
          projectId,
          status: 'delivered',
          subjectId: site.id,
          subjectType: 'site',
          userId: this.userId,
          visibility: 'private',
          workspaceId: project.workspaceId,
        })
        .returning();
      await tx.insert(verifyRuns).values({
        acceptanceId: acceptance.id,
        metadata: previewUrl ? { previewUrl } : {},
        roundIndex: 1,
        userId: this.userId,
        workspaceId: project.workspaceId,
      });
      const [linked] = await tx
        .update(projectSites)
        .set({ acceptanceId: acceptance.id })
        .where(eq(projectSites.id, site.id))
        .returning();
      return linked;
    });
  }

  async updateSite(siteId: string, input: Partial<SiteInput>) {
    const site = await this.findSite(siteId);
    await this.assertManager(site.projectId);
    const name = input.name?.trim();
    const origins = input.origins ? this.normalizeOrigins(input.origins) : undefined;

    const updated = await this.sites.update(siteId, { name, origins });
    if (name && site.acceptanceId) {
      const [acceptance] = await this.db
        .select({ metadata: acceptances.metadata })
        .from(acceptances)
        .where(eq(acceptances.id, site.acceptanceId));
      await this.db
        .update(acceptances)
        .set({ metadata: { ...acceptance?.metadata, title: siteReviewTitle(name) } })
        .where(eq(acceptances.id, site.acceptanceId));
    }
    return updated;
  }

  async deleteSite(siteId: string) {
    const site = await this.findSite(siteId);
    await this.assertManager(site.projectId);
    await this.db.transaction(async (tx) => {
      await tx.delete(projectSites).where(eq(projectSites.id, siteId));
      if (site.acceptanceId)
        await tx.delete(acceptances).where(eq(acceptances.id, site.acceptanceId));
    });
  }

  async listMembers(projectId: string) {
    const project = await this.assertManager(projectId);
    const rows = await this.members.listByProject(projectId);
    const userIds = [project.userId, ...rows.map((row) => row.userId)].filter((id): id is string =>
      Boolean(id),
    );
    const people = userIds.length
      ? await this.db
          .select({
            avatar: users.avatar,
            email: users.email,
            fullName: users.fullName,
            id: users.id,
            username: users.username,
          })
          .from(users)
          .where(inArray(users.id, userIds))
      : [];
    const teammates = new Set(
      project.workspaceId && userIds.length
        ? (
            await this.db
              .select({ userId: workspaceMembers.userId })
              .from(workspaceMembers)
              .where(
                and(
                  eq(workspaceMembers.workspaceId, project.workspaceId),
                  inArray(workspaceMembers.userId, userIds),
                ),
              )
          ).map((row) => row.userId)
        : [],
    );
    const personOf = (id: string | null) => {
      const person = id ? people.find((item) => item.id === id) : undefined;
      return person
        ? {
            avatar: person.avatar,
            email: person.email,
            name: person.fullName || person.username || person.email,
          }
        : null;
    };

    return {
      members: rows.map(({ inviteToken: _token, ...row }) => ({
        ...row,
        guest: Boolean(project.workspaceId && row.userId && !teammates.has(row.userId)),
        user: personOf(row.userId),
      })),
      owner: personOf(project.userId),
      reviewWorkspaceMembers: project.reviewWorkspaceMembers,
    };
  }

  async inviteMember(projectId: string, input: { email: string; role: ProjectMemberRole }) {
    const project = await this.assertManager(projectId);
    const member = await this.members.invite({
      email: input.email,
      invitedByUserId: this.userId,
      projectId,
      role: input.role,
    });
    const inviteUrl = member.inviteToken
      ? new URL(`/invite/project/${member.inviteToken}`, appEnv.APP_URL).toString()
      : '';
    if (inviteUrl) await this.mailInvite(member.email, project, inviteUrl);
    return { inviteUrl, member };
  }

  async updateMemberRole(memberId: string, role: ProjectMemberRole) {
    const member = await this.findMember(memberId);
    await this.assertManager(member.projectId);
    return this.members.updateRole(memberId, role);
  }

  async revokeMember(memberId: string) {
    const member = await this.findMember(memberId);
    await this.assertManager(member.projectId);
    return this.members.revoke(memberId);
  }

  async setReviewWorkspaceMembers(projectId: string, enabled: boolean) {
    await this.assertManager(projectId);
    await this.db
      .update(projects)
      .set({ reviewWorkspaceMembers: enabled })
      .where(eq(projects.id, projectId));
  }

  async getInvite(token: string): Promise<ProjectInviteView> {
    const invite = await this.members.findByToken(token);
    if (!invite) return { status: 'notFound' };
    if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) return { status: 'expired' };

    const project = await findProjectReviewScope(this.db, invite.projectId);
    if (!project) return { status: 'notFound' };
    const [me] = await this.db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, this.userId));
    const inviter = invite.invitedByUserId ? await this.displayName(invite.invitedByUserId) : null;

    return {
      email: invite.email,
      emailMatches: me?.email?.trim().toLowerCase() === invite.email,
      inviterName: inviter,
      projectName: project.name,
      role: invite.role,
      status: 'valid',
    };
  }

  async acceptInvite(token: string) {
    const [me] = await this.db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, this.userId));
    const result = await this.members.accept(token, { email: me?.email, userId: this.userId });
    if (!result.ok)
      throw new TRPCError({ code: 'BAD_REQUEST', message: `invite:${result.reason}` });
    return result.member;
  }

  private normalizeOrigins(input: string[]) {
    if (input.length === 0)
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'invalidOrigin:0:invalid' });
    const origins = input.map((value, index) => {
      const result = normalizeSiteOrigin(value);
      if (!result.ok) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `invalidOrigin:${index}:${result.reason}`,
        });
      }
      return result.origin;
    });
    return [...new Set(origins)];
  }

  private async assertManager(projectId: string): Promise<ProjectReviewScope> {
    const project = await findProjectReviewScope(this.db, projectId);
    if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
    if (!(await canManageProjectReview(this.db, this.userId, project))) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot manage review access' });
    }
    return project;
  }

  private async findSite(siteId: string) {
    const site = await this.sites.findById(siteId);
    if (!site) throw new TRPCError({ code: 'NOT_FOUND', message: 'Site not found' });
    return site;
  }

  private async findMember(memberId: string) {
    const member = await this.members.findById(memberId);
    if (!member) throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' });
    return member;
  }

  private async displayName(userId: string) {
    const [user] = await this.db
      .select({ email: users.email, fullName: users.fullName, username: users.username })
      .from(users)
      .where(eq(users.id, userId));
    return user?.fullName || user?.username || user?.email || null;
  }

  private async mailInvite(email: string, project: ProjectReviewScope, inviteUrl: string) {
    const inviter = (await this.displayName(this.userId)) ?? 'A LobeHub user';
    const projectName = escapeHtml(project.name);
    try {
      await new EmailService().sendMail({
        html: `<p>${escapeHtml(inviter)} invited you to review <strong>${projectName}</strong> on LobeHub.</p><p><a href="${inviteUrl}">Accept the invitation</a></p><p>This link expires in 7 days.</p>`,
        subject: `Review ${project.name} on LobeHub`,
        text: `${inviter} invited you to review ${project.name} on LobeHub: ${inviteUrl} (expires in 7 days)`,
        to: email,
      });
    } catch (error) {
      log('invite email failed: %O', error);
    }
  }
}
