/**
 * @vitest-environment happy-dom
 */
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DevicePresenceDot from './DevicePresenceDot';

const mocks = vi.hoisted(() => ({
  confirmed: true,
  hydrate: vi.fn(() => ({ isLoading: false })),
  agencyConfig: undefined as Record<string, unknown> | undefined,
  devices: undefined as Array<Record<string, unknown>> | undefined,
}));

vi.mock('@/hooks/useEffectiveAgencyConfig', () => ({
  useEffectiveAgencyConfig: () => ({ agencyConfig: mocks.agencyConfig }),
}));

vi.mock('@/store/device', () => ({
  isDevicePresenceUnknown: (device: { onlineUnknown?: boolean }) => !!device.onlineUnknown,
  useDeviceList: () => ({ data: mocks.devices, isConfirmed: mocks.confirmed }),
}));

vi.mock('@/store/agent', () => ({
  useAgentStore: (selector: (state: unknown) => unknown) =>
    selector({ useHydrateAgentConfig: mocks.hydrate }),
}));

vi.mock('@/store/user', () => ({
  useUserStore: (selector: (state: unknown) => unknown) => selector({}),
}));

vi.mock('@/store/user/selectors', () => ({ authSelectors: { isLogin: () => true } }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@lobehub/ui', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const hetero = { boundDeviceId: 'dev-1', heterogeneousProvider: { type: 'claude-code' } };

describe('DevicePresenceDot', () => {
  beforeEach(() => {
    mocks.confirmed = true;
    mocks.hydrate.mockClear();
    mocks.hydrate.mockReturnValue({ isLoading: false });
    mocks.agencyConfig = hetero;
    mocks.devices = [{ deviceId: 'dev-1', online: true }];
  });

  it('hydrates the bucket agent config so an agent the sidebar never opened still resolves', () => {
    // ROOT CAUSE: by-agent buckets name agents that are not in the agent store,
    // so the bound device read as absent and the dot never rendered.
    render(<DevicePresenceDot agentId="agt-1" />);

    expect(mocks.hydrate).toHaveBeenCalledWith(true, 'agt-1');
  });

  it('shows an online dot when the bound device is online', () => {
    render(<DevicePresenceDot agentId="agt-1" />);

    expect(screen.getByTestId('agent-device-presence').dataset.online).toBe('true');
  });

  it('shows an offline dot when the bound device is offline', () => {
    mocks.devices = [{ deviceId: 'dev-1', online: false }];

    render(<DevicePresenceDot agentId="agt-1" />);

    expect(screen.getByTestId('agent-device-presence').dataset.online).toBe('false');
  });

  it('follows the bound device for a regular (non-hetero) agent too', () => {
    // Feedback: a regular agent pinned to a device must show that device's
    // presence, not be skipped for lacking a heterogeneous provider.
    mocks.agencyConfig = { boundDeviceId: 'dev-1', executionTarget: 'device' };
    mocks.devices = [{ deviceId: 'dev-1', online: false }];

    render(<DevicePresenceDot agentId="agt-1" />);

    expect(screen.getByTestId('agent-device-presence').dataset.online).toBe('false');
  });

  it('defaults a regular agent with no bound device to online', () => {
    mocks.agencyConfig = undefined;

    render(<DevicePresenceDot agentId="agt-1" />);

    expect(screen.getByTestId('agent-device-presence').dataset.online).toBe('true');
  });

  it('defaults to online when the bound device is absent from the caller-scoped list', () => {
    mocks.devices = [{ deviceId: 'other', online: false }];

    render(<DevicePresenceDot agentId="agt-1" />);

    expect(screen.getByTestId('agent-device-presence').dataset.online).toBe('true');
  });

  it('renders nothing while the device list is only the persisted copy', () => {
    mocks.confirmed = false;

    render(<DevicePresenceDot agentId="agt-1" />);

    expect(screen.queryByTestId('agent-device-presence')).toBeNull();
  });

  it('renders nothing when the bound device presence is still unknown', () => {
    mocks.devices = [{ deviceId: 'dev-1', online: false, onlineUnknown: true }];

    render(<DevicePresenceDot agentId="agt-1" />);

    expect(screen.queryByTestId('agent-device-presence')).toBeNull();
  });

  it('renders nothing until the agent config and device list have loaded', () => {
    mocks.hydrate.mockReturnValue({ isLoading: true });
    const { rerender } = render(<DevicePresenceDot agentId="agt-1" />);
    expect(screen.queryByTestId('agent-device-presence')).toBeNull();

    mocks.hydrate.mockReturnValue({ isLoading: false });
    mocks.devices = undefined;
    rerender(<DevicePresenceDot agentId="agt-1" />);
    expect(screen.queryByTestId('agent-device-presence')).toBeNull();
  });
});
