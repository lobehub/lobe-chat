/**
 * @vitest-environment happy-dom
 */
import { AccordionRoot } from '@lobehub/ui';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TopicListScopeContext } from '../../TopicListScope';
import GroupItem from './GroupItem';

const subGroupModes: Record<string, string> = {};
let registeredMeta: { avatar?: string; name?: string; title?: string } = {};

vi.mock('@/store/agent', () => ({
  useAgentStore: (selector: (state: unknown) => unknown) => selector({ activeAgentId: 'agent-1' }),
}));

vi.mock('@/store/agent/selectors', () => ({
  agentSelectors: {
    currentAgentMeta: () => ({ title: '验收合并-Alpha', avatar: '🅰️' }),
    getAgentMetaById: () => () => registeredMeta,
  },
}));

vi.mock('@/store/global', () => ({
  useGlobalStore: (selector: (state: unknown) => unknown) =>
    selector({ updateSystemStatus: vi.fn() }),
}));

vi.mock('@/store/global/selectors', () => ({
  systemStatusSelectors: {
    projectTopicSubGroupMode: (id: string) => () => subGroupModes[id] ?? 'none',
  },
}));

const directories: { deviceId: string; id: string; instanceId?: string }[] = [];

vi.mock('@/store/projectWorkingDirectory', () => ({
  useProjectDirectories: () => directories,
}));

vi.mock('@/features/Projects/WorkingDirectories/StartDirectoryModal', () => ({
  openProjectTopicModal: vi.fn(),
}));

vi.mock('@/store/device', () => ({
  deviceSelectors: { deviceList: (s: { devices: unknown[] }) => s.devices },
  useDeviceStore: (selector: (state: object) => unknown) =>
    selector({
      devices: [
        { deviceId: 'device-1', friendlyName: 'MacBook' },
        { deviceId: 'device-2', friendlyName: 'Studio Linux' },
      ],
      useFetchDevices: () => ({}),
    }),
}));

vi.mock('@/store/user', () => ({
  useUserStore: (selector: (state: object) => unknown) => selector({}),
}));
vi.mock('@/store/user/selectors', () => ({
  preferenceSelectors: { topicSortBy: () => 'updatedAt' },
}));

vi.mock('@/store/chat', () => ({
  useChatStore: (selector: (state: object) => unknown) => selector({}),
}));
vi.mock('@/store/chat/selectors', () => ({
  operationSelectors: {
    unreadCompletedCountForTopics: () => () => 0,
    visiblyRunningTopicIds: () => new Set(),
  },
}));

vi.mock('@/components/RingLoading', () => ({ default: () => <span /> }));

// Capture what the group hands each row: by-agent buckets are named in the
// group header, and the whole list already sits inside one project.
vi.mock('../../List/Item', () => ({
  default: (props: {
    showWorkingDirectory?: boolean;
    suppressAgentAvatar?: boolean;
    title: string;
  }) => (
    <div
      data-directory={props.showWorkingDirectory ? 'yes' : 'no'}
      data-suppress={props.suppressAgentAvatar ? 'yes' : 'no'}
    >
      {props.title}
    </div>
  ),
}));

vi.mock('@lobehub/ui', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...(await import('~base-ui-stubs')).baseUiStubs,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const GROUP_ID = 'agent:agt_acc_merge_alpha';

const renderGroup = () =>
  render(
    <TopicListScopeContext value={{ projectId: 'project-1' }}>
      <AccordionRoot defaultValue={[GROUP_ID]}>
        <GroupItem
          expanded
          group={{
            children: [
              {
                createdAt: 1,
                id: 't1',
                projectWorkingDirectoryId: 'binding-mac',
                title: 'A1-目录A任务',
                updatedAt: 1,
              },
              {
                createdAt: 2,
                id: 't2',
                projectWorkingDirectoryId: 'binding-linux',
                title: 'A2-目录B任务',
                updatedAt: 2,
              },
            ],
            id: GROUP_ID,
            title: '验收合并-Alpha',
          }}
        />
      </AccordionRoot>
    </TopicListScopeContext>,
  );

describe('TopicByAgentGroupItem', () => {
  beforeEach(() => {
    for (const key of Object.keys(subGroupModes)) delete subGroupModes[key];
    registeredMeta = {};
    directories.splice(
      0,
      directories.length,
      { deviceId: 'device-1', id: 'binding-mac' },
      { deviceId: 'device-2', id: 'binding-linux' },
    );
  });

  /** @example Review feedback: rows under an agent-named bucket must not repeat the avatar. */
  it('suppresses the row leading agent avatar because the group header already identifies the agent', () => {
    // ROOT CAUSE: the by-agent grouping named every bucket after its agent,
    // but each row still rendered the same avatar at its leading position —
    // the same identity twice in one row.
    renderGroup();

    expect(screen.getByText('A1-目录A任务').getAttribute('data-suppress')).toBe('yes');
  });

  /** @example User report: project sidebar rows repeated "develop-center · branch" on every topic. */
  it('does not repeat the working directory on rows that already sit inside the project', () => {
    renderGroup();

    expect(screen.getByText('A1-目录A任务').getAttribute('data-directory')).toBe('no');
    expect(screen.getByText('A2-目录B任务').getAttribute('data-directory')).toBe('no');
  });

  it('offers a second-level grouping and sections the agent topics by device', () => {
    subGroupModes[GROUP_ID] = 'byDevice';
    renderGroup();

    expect(screen.getByRole('button', { name: 'topics.subGroup.title' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'MacBook' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Studio Linux' })).toBeTruthy();
    expect(screen.getByText('A1-目录A任务').getAttribute('data-suppress')).toBe('yes');
  });

  /** @example Acceptance: a device without an environment opened the modal on a raw directory id. */
  it('offers a device section "+" only where that device has an instance-bound directory', () => {
    // ROOT CAUSE: the section "+" preselected any project directory on the
    // device, but the new-topic modal only lists instance-bound directories,
    // so a legacy directory opened with an unselectable raw id.
    subGroupModes[GROUP_ID] = 'byDevice';
    directories[0] = { ...directories[0], instanceId: 'ins-mac' };
    renderGroup();

    expect(screen.getAllByRole('button', { name: 'directories.start' })).toHaveLength(1);
  });

  const renderInProject = (agentId: string) =>
    render(
      <TopicListScopeContext value={{ coordinatorAgentId: 'agt_lead', projectId: 'prj_1' }}>
        <AccordionRoot>
          <GroupItem
            expanded={false}
            group={{
              children: [{ createdAt: 1, id: 't1', title: 'Plan', updatedAt: 1 }],
              id: `agent:${agentId}`,
              title: agentId,
            }}
          />
        </AccordionRoot>
      </TopicListScopeContext>,
    );

  /** @example User report: the project sidebar named an agent bucket by its role, not its name. */
  it('names an untitled bucket after the registered agent name, not its title', () => {
    // ROOT CAUSE: the registry fallback read `title` before `name`, so a named
    // agent ("Cook") showed its role ("公共CC(美国 100刀)") as the group label.
    registeredMeta = { name: 'Cook', title: '公共CC(美国 100刀)' };
    render(
      <TopicListScopeContext value={{ coordinatorAgentId: 'agt_lead', projectId: 'prj_1' }}>
        <AccordionRoot>
          <GroupItem
            expanded={false}
            group={{
              children: [{ createdAt: 1, id: 't1', title: 'Plan', updatedAt: 1 }],
              id: 'agent:agt_cook',
            }}
          />
        </AccordionRoot>
      </TopicListScopeContext>,
    );

    expect(screen.getAllByText('Cook').length).toBeGreaterThan(0);
    expect(screen.queryByText('公共CC(美国 100刀)')).toBeNull();
  });

  it("tags the project's main agent as its lead", () => {
    renderInProject('agt_lead');

    expect(screen.getByText('sidebar.coordinatorTag')).toBeTruthy();
  });

  it('leaves other member agents untagged', () => {
    renderInProject('agt_writer');

    expect(screen.queryByText('sidebar.coordinatorTag')).toBeNull();
  });
});
