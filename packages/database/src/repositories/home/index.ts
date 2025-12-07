import { and, desc, eq, ilike, or } from 'drizzle-orm';

import { agents, agentsToSessions, chatGroups, sessionGroups, sessions } from '../../schemas';
import { LobeChatDatabase } from '../../type';

export type SidebarItemType = 'agent' | 'group';

export interface SidebarAgentItem {
  avatar?: string | null;
  description?: string | null;
  id: string;
  pinned: boolean;
  sessionId?: string | null;
  title: string | null;
  type: SidebarItemType;
  updatedAt: Date;
}

export interface SidebarGroup {
  id: string;
  items: SidebarAgentItem[];
  name: string;
  sort: number | null;
}

export interface SidebarAgentListResponse {
  groups: SidebarGroup[];
  pinned: SidebarAgentItem[];
  ungrouped: SidebarAgentItem[];
}

/**
 * Home Repository - provides sidebar agent list data
 */
export class HomeRepository {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  /**
   * Get sidebar agent list with pinned, grouped, and ungrouped items
   */
  async getSidebarAgentList(): Promise<SidebarAgentListResponse> {
    // 1. Query all agents (non-virtual) with their session info
    const agentList = await this.db
      .select({
        avatar: agents.avatar,
        description: agents.description,
        groupId: sessions.groupId,
        id: agents.id,
        pinned: sessions.pinned,
        sessionId: sessions.id,
        title: agents.title,
        updatedAt: agents.updatedAt,
      })
      .from(agents)
      .innerJoin(agentsToSessions, eq(agents.id, agentsToSessions.agentId))
      .innerJoin(sessions, eq(agentsToSessions.sessionId, sessions.id))
      .where(and(eq(agents.userId, this.userId), eq(agents.virtual, false)))
      .orderBy(desc(agents.updatedAt));

    // 2. Query all chatGroups (group chats)
    const chatGroupList = await this.db
      .select({
        description: chatGroups.description,
        groupId: chatGroups.groupId,
        id: chatGroups.id,
        pinned: chatGroups.pinned,
        title: chatGroups.title,
        updatedAt: chatGroups.updatedAt,
      })
      .from(chatGroups)
      .where(eq(chatGroups.userId, this.userId))
      .orderBy(desc(chatGroups.updatedAt));

    // 3. Query all sessionGroups (user-defined folders)
    const groupList = await this.db
      .select({
        id: sessionGroups.id,
        name: sessionGroups.name,
        sort: sessionGroups.sort,
      })
      .from(sessionGroups)
      .where(eq(sessionGroups.userId, this.userId))
      .orderBy(sessionGroups.sort);

    // 4. Process and categorize
    return this.processAgentList(agentList, chatGroupList, groupList);
  }

  private processAgentList(
    agentItems: Array<{
      avatar: string | null;
      description: string | null;
      groupId: string | null;
      id: string;
      pinned: boolean | null;
      sessionId: string;
      title: string | null;
      updatedAt: Date;
    }>,
    chatGroupItems: Array<{
      description: string | null;
      groupId: string | null;
      id: string;
      pinned: boolean | null;
      title: string | null;
      updatedAt: Date;
    }>,
    groupItems: Array<{
      id: string;
      name: string;
      sort: number | null;
    }>,
  ): SidebarAgentListResponse {
    // Convert to unified format
    const allItems: Array<SidebarAgentItem & { groupId: string | null }> = [
      ...agentItems.map((a) => ({
        avatar: a.avatar,
        description: a.description,
        groupId: a.groupId,
        id: a.id,
        pinned: a.pinned ?? false,
        sessionId: a.sessionId,
        title: a.title,
        type: 'agent' as const,
        updatedAt: a.updatedAt,
      })),
      ...chatGroupItems.map((g) => ({
        avatar: null,
        description: g.description,
        groupId: g.groupId,
        id: g.id,
        pinned: g.pinned ?? false,
        sessionId: null,
        title: g.title,
        type: 'group' as const,
        updatedAt: g.updatedAt,
      })),
    ];

    // Sort all items by updatedAt descending
    allItems.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // Categorize: pinned / grouped / ungrouped
    const pinned: SidebarAgentItem[] = [];
    const ungrouped: SidebarAgentItem[] = [];
    const groupedMap = new Map<string, SidebarAgentItem[]>();

    for (const item of allItems) {
      const { groupId, ...sidebarItem } = item;

      if (item.pinned) {
        pinned.push(sidebarItem);
      } else if (groupId) {
        const existing = groupedMap.get(groupId) || [];
        existing.push(sidebarItem);
        groupedMap.set(groupId, existing);
      } else {
        ungrouped.push(sidebarItem);
      }
    }

    // Build groups array with items
    const groups: SidebarGroup[] = groupItems.map((g) => ({
      id: g.id,
      items: groupedMap.get(g.id) || [],
      name: g.name,
      sort: g.sort,
    }));

    return { groups, pinned, ungrouped };
  }

  /**
   * Search agents and chat groups by keyword
   * Searches in title and description fields
   */
  async searchAgents(keyword: string): Promise<SidebarAgentItem[]> {
    if (!keyword.trim()) return [];

    const searchPattern = `%${keyword.toLowerCase()}%`;

    // 1. Search agents by title or description
    const agentResults = await this.db
      .select({
        avatar: agents.avatar,
        description: agents.description,
        id: agents.id,
        pinned: sessions.pinned,
        sessionId: sessions.id,
        title: agents.title,
        updatedAt: agents.updatedAt,
      })
      .from(agents)
      .innerJoin(agentsToSessions, eq(agents.id, agentsToSessions.agentId))
      .innerJoin(sessions, eq(agentsToSessions.sessionId, sessions.id))
      .where(
        and(
          eq(agents.userId, this.userId),
          eq(agents.virtual, false),
          or(ilike(agents.title, searchPattern), ilike(agents.description, searchPattern)),
        ),
      )
      .orderBy(desc(agents.updatedAt));

    // 2. Search chat groups by title or description
    const chatGroupResults = await this.db
      .select({
        description: chatGroups.description,
        id: chatGroups.id,
        pinned: chatGroups.pinned,
        title: chatGroups.title,
        updatedAt: chatGroups.updatedAt,
      })
      .from(chatGroups)
      .where(
        and(
          eq(chatGroups.userId, this.userId),
          or(ilike(chatGroups.title, searchPattern), ilike(chatGroups.description, searchPattern)),
        ),
      )
      .orderBy(desc(chatGroups.updatedAt));

    // 3. Combine and format results
    const results: SidebarAgentItem[] = [
      ...agentResults.map((a) => ({
        avatar: a.avatar,
        description: a.description,
        id: a.id,
        pinned: a.pinned ?? false,
        sessionId: a.sessionId,
        title: a.title,
        type: 'agent' as const,
        updatedAt: a.updatedAt,
      })),
      ...chatGroupResults.map((g) => ({
        avatar: null,
        description: g.description,
        id: g.id,
        pinned: g.pinned ?? false,
        sessionId: null,
        title: g.title,
        type: 'group' as const,
        updatedAt: g.updatedAt,
      })),
    ];

    // Sort by updatedAt descending
    results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return results;
  }
}
