import type { SidebarAgentListResponse } from '@/database/repositories/home';
import { lambdaClient } from '@/libs/trpc/client';

export class HomeService {
  /**
   * Get sidebar agent list with pinned, grouped, and ungrouped items
   */
  getSidebarAgentList = (): Promise<SidebarAgentListResponse> => {
    return lambdaClient.home.getSidebarAgentList.query();
  };
}

export const homeService = new HomeService();
