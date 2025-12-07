import type { SidebarAgentItem, SidebarAgentListResponse } from '@/database/repositories/home';
import { lambdaClient } from '@/libs/trpc/client';

export class HomeService {
  /**
   * Get sidebar agent list with pinned, grouped, and ungrouped items
   */
  getSidebarAgentList = (): Promise<SidebarAgentListResponse> => {
    return lambdaClient.home.getSidebarAgentList.query();
  };

  /**
   * Search agents by keyword
   */
  searchAgents = (keyword: string): Promise<SidebarAgentItem[]> => {
    return lambdaClient.home.searchAgents.query({ keyword });
  };
}

export const homeService = new HomeService();
