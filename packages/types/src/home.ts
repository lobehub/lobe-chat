/**
 * Sidebar item type - can be an agent or a chat group
 */
export type SidebarItemType = 'agent' | 'group';

/**
 * Sidebar agent item - represents an agent or chat group in the sidebar
 */
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

/**
 * Sidebar group - a user-defined folder containing agents
 */
export interface SidebarGroup {
  id: string;
  items: SidebarAgentItem[];
  name: string;
  sort: number | null;
}

/**
 * Response structure for sidebar agent list
 */
export interface SidebarAgentListResponse {
  groups: SidebarGroup[];
  pinned: SidebarAgentItem[];
  ungrouped: SidebarAgentItem[];
}
