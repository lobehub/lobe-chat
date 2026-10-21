/**
 * @vitest-environment happy-dom
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { agentQuotaService } from '@/services/agentQuota';
import { useAgentQuotaStore } from '@/store/agentQuota';
import {
  QUOTA_ACCOUNTS_KEY,
  type QuotaAccount,
  type QuotaBinding,
} from '@/store/agentQuota/projection';

import QuotaAccountManager from './QuotaAccountManagerModal';
import { isolateQuotaReplica } from './testUtils';

const account = (id: string) =>
  ({
    email: `${id}@example.com`,
    externalAccountId: `ext-${id}`,
    id,
    label: null,
    provider: 'claude-code',
  }) as unknown as QuotaAccount;

/** The label of the option the radio group shows as selected. */
const checkedOption = () =>
  screen.getByRole('radio', { checked: true }).closest('label')?.textContent;

const binding = (id: string, accountId: string, role: string) =>
  ({ accountId, agentId: 'agent-1', id, role }) as unknown as QuotaBinding;

describe('QuotaAccountManager', () => {
  beforeEach(() => {
    isolateQuotaReplica();
    vi.spyOn(agentQuotaService, 'listAccounts').mockResolvedValue([account('a1')]);
    vi.spyOn(agentQuotaService, 'getLatestReadings').mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows no "no account" hint and keeps the controls disabled until the bindings load', async () => {
    let answerBindings!: (rows: QuotaBinding[]) => void;
    vi.spyOn(agentQuotaService, 'listBindings').mockImplementation(
      () => new Promise((resolve) => (answerBindings = resolve)),
    );
    // The account pool painted from the replica; this agent's bindings did not.
    act(() =>
      useAgentQuotaStore.setState({ quotaAccountsMap: { [QUOTA_ACCOUNTS_KEY]: [account('a1')] } }),
    );

    render(<QuotaAccountManager agentId={'agent-1'} />);

    expect(screen.getByText('a1@example.com')).toBeTruthy();
    expect(screen.queryByText('heteroAgent.claudeQuota.manage.autoNoAccount')).toBeNull();
    expect(screen.getByRole('switch').hasAttribute('disabled')).toBe(true);
    expect(screen.queryByRole('radio', { checked: true })).toBeNull();

    await act(async () => answerBindings([binding('b1', 'a1', 'pool')]));

    expect(screen.queryByText('heteroAgent.claudeQuota.manage.autoNoAccount')).toBeNull();
    expect(screen.getByText(/heteroAgent\.claudeQuota\.manage\.autoRoutingTo/)).toBeTruthy();
    expect(screen.getByRole('switch').hasAttribute('disabled')).toBe(false);
    // Auto is the confirmed mode now, and the group shows it.
    expect(checkedOption()).toContain('heteroAgent.claudeQuota.manage.modeAuto');
  });

  it('selects the pinned account once the bindings load', async () => {
    let answerBindings!: (rows: QuotaBinding[]) => void;
    vi.spyOn(agentQuotaService, 'listBindings').mockImplementation(
      () => new Promise((resolve) => (answerBindings = resolve)),
    );
    act(() =>
      useAgentQuotaStore.setState({ quotaAccountsMap: { [QUOTA_ACCOUNTS_KEY]: [account('a1')] } }),
    );

    render(<QuotaAccountManager agentId={'agent-1'} />);
    await act(async () => answerBindings([binding('b1', 'a1', 'pinned')]));

    expect(checkedOption()).toContain('a1@example.com');
  });

  it('shows hydrated bindings but takes writes only after the server confirms them', async () => {
    let answerBindings!: (rows: QuotaBinding[]) => void;
    vi.spyOn(agentQuotaService, 'listBindings').mockImplementation(
      () => new Promise((resolve) => (answerBindings = resolve)),
    );
    // Restored from storage: a1 pinned, but another device has since moved it to the pool.
    act(() =>
      useAgentQuotaStore.setState({
        quotaAccountsMap: { [QUOTA_ACCOUNTS_KEY]: [account('a1')] },
        quotaBindingsMap: { 'agent-1': [binding('b1', 'a1', 'pinned')] },
      }),
    );

    render(<QuotaAccountManager agentId={'agent-1'} />);

    expect(checkedOption()).toContain('a1@example.com');
    expect(screen.getByRole('switch').hasAttribute('disabled')).toBe(true);
    for (const radio of screen.getAllByRole('radio'))
      expect(radio.getAttribute('aria-disabled')).toBe('true');

    await act(async () => answerBindings([binding('b1', 'a1', 'pool')]));

    expect(checkedOption()).toContain('heteroAgent.claudeQuota.manage.modeAuto');
    expect(screen.getByRole('switch').hasAttribute('disabled')).toBe(false);
    expect(
      screen
        .getByRole('radio', { name: /heteroAgent\.claudeQuota\.manage\.modeAuto/ })
        .getAttribute('aria-disabled'),
    ).not.toBe('true');
  });

  it('offers Remove for a hydrated binding only after the server confirms it', async () => {
    let answerBindings!: (rows: QuotaBinding[]) => void;
    vi.spyOn(agentQuotaService, 'listBindings').mockImplementation(
      () => new Promise((resolve) => (answerBindings = resolve)),
    );
    act(() =>
      useAgentQuotaStore.setState({
        quotaAccountsMap: { [QUOTA_ACCOUNTS_KEY]: [account('a1')] },
        quotaBindingsMap: { 'agent-1': [binding('stale', 'a1', 'pool')] },
      }),
    );
    const removeItem = () =>
      screen.findByRole('menuitem', { name: /heteroAgent\.claudeQuota\.manage\.remove/ });

    render(<QuotaAccountManager agentId={'agent-1'} />);
    fireEvent.click(screen.getByRole('button', { name: 'heteroAgent.claudeQuota.manage.more' }));

    expect((await removeItem()).getAttribute('aria-disabled')).toBe('true');

    await act(async () => answerBindings([binding('b1', 'a1', 'pool')]));

    expect((await removeItem()).getAttribute('aria-disabled')).not.toBe('true');
  });
});
