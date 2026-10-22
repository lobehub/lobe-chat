import { describe, expect, it } from 'vitest';

import {
  getProjectAcceptancePath,
  getProjectAgentPath,
  getProjectConversationPath,
  getProjectConversationStartPath,
  getProjectDashboardPath,
  getProjectGoalsPath,
  getProjectLibraryPath,
  getProjectTasksPath,
  isProjectSectionActive,
} from './navigation';

describe('project workspace navigation', () => {
  it('builds routes for project agents and libraries', () => {
    expect(getProjectAgentPath('agt_1')).toBe('/agent/agt_1');
    expect(getProjectLibraryPath('prj_1', 'kb_1')).toBe('/project/prj_1/library/kb_1');
    expect(getProjectTasksPath('prj_1')).toBe('/project/prj_1/tasks');
    expect(getProjectGoalsPath('prj_1')).toBe('/project/prj_1/goals');
    expect(getProjectAcceptancePath('prj_1')).toBe('/project/prj_1/acceptance');
  });

  it('builds the project dashboard list and board routes', () => {
    expect(getProjectDashboardPath('prj_1')).toBe('/project/prj_1/dashboard');
    expect(getProjectDashboardPath('prj_1', 'd-1')).toBe('/project/prj_1/dashboard/d-1');
  });

  it('builds new and existing conversation routes inside the project', () => {
    expect(getProjectConversationPath('prj_1')).toBe('/project/prj_1/conversation');
    expect(getProjectConversationPath('prj_1', 'tpc_1')).toBe('/project/prj_1/conversation/tpc_1');
    expect(getProjectConversationStartPath('prj_1', 'Plan Q3 & ship')).toBe(
      '/project/prj_1/conversation?message=Plan%20Q3%20%26%20ship',
    );
  });
});

describe('isProjectSectionActive', () => {
  /** @example Acceptance: opening a record un-highlighted the Acceptance nav item. */
  it('keeps a section active on its own record pages', () => {
    const section = getProjectAcceptancePath('prj_1');

    expect(isProjectSectionActive(section, section)).toBe(true);
    expect(isProjectSectionActive(`${section}/acc_1`, section)).toBe(true);
    expect(isProjectSectionActive(`${section}/acc_1/check/chk_1`, section)).toBe(true);
  });

  it('does not match a sibling path that only shares the prefix', () => {
    expect(
      isProjectSectionActive('/project/prj_1/acceptance-old', '/project/prj_1/acceptance'),
    ).toBe(false);
  });
});
