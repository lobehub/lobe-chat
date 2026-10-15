import type { ProjectMemberRole } from '@lobechat/types';
import { normalizeSiteOrigin } from '@lobechat/utils/siteOrigin';
import { TRPCError } from '@trpc/server';
import { and, asc, eq, isNull } from 'drizzle-orm';

import { ProjectMemberModel, ProjectSiteModel } from '@/database/models/projectReview';
import { acceptances, projectSites, users, verifyRuns, workspaceMembers } from '@/database/schemas';
import type { LobeChatDatabase } from '@/database/type';
import {
  canManageProjectReview,
  findProjectReviewScope,
  type ProjectReviewScope,
} from '@/server/services/acceptanceReview/projectAccess';

const siteReviewTitle = (name: string) => `Site review · ${name}`;

export interface SiteInput {
  name: string;
  origins: string[];
}

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
    const people = project.workspaceId
      ? await this.db
          .select({
            avatar: users.avatar,
            email: users.email,
            fullName: users.fullName,
            userId: users.id,
            username: users.username,
          })
          .from(workspaceMembers)
          .innerJoin(users, eq(users.id, workspaceMembers.userId))
          .where(
            and(
              eq(workspaceMembers.workspaceId, project.workspaceId),
              isNull(workspaceMembers.deletedAt),
            ),
          )
          .orderBy(asc(users.fullName), asc(users.username), asc(users.id))
      : [];
    const profiles = people.map(({ fullName, username, ...person }) => ({
      ...person,
      name: fullName || username || person.email || person.userId,
    }));
    const peopleById = new Map(profiles.map((person) => [person.userId, person]));
    const assigned = new Set([project.userId, ...rows.map((row) => row.userId)]);
    return {
      availableMembers: profiles.filter((person) => !assigned.has(person.userId)),
      members: rows.map((row) => ({ ...row, user: peopleById.get(row.userId) ?? null })),
      owner: peopleById.get(project.userId) ?? null,
      workspaceId: project.workspaceId,
    };
  }

  async addMember(projectId: string, input: { userId: string; role: ProjectMemberRole }) {
    const project = await this.assertManager(projectId);
    if (!project.workspaceId)
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Project members require a workspace' });
    const member = await this.members.add({ ...input, addedByUserId: this.userId, projectId });
    if (!member)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Select an active member of this project workspace',
      });
    return member;
  }

  async updateMemberRole(memberId: string, role: ProjectMemberRole) {
    const member = await this.findMember(memberId);
    await this.assertManager(member.projectId);
    return this.members.updateRole(memberId, role);
  }

  async removeMember(memberId: string) {
    const member = await this.findMember(memberId);
    await this.assertManager(member.projectId);
    return this.members.remove(memberId);
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
}
