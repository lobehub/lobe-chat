'use client';

import { currentUtilization, isWeeklyAllLimit } from '@lobechat/heterogeneous-agents/quota';
import { createStaticStyles, cssVar, DropdownMenu, Flexbox, Icon } from '@lobehub/ui';
import {
  ActionIcon,
  Button,
  createModal,
  Input,
  type ModalInstance,
  RadioGroup,
  Switch,
  Text,
} from '@lobehub/ui';
import { t as i18nT } from 'i18next';
import {
  CheckIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
  ZapIcon,
} from 'lucide-react';
import { memo, type MouseEvent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cacheScope } from '@/libs/replica';
import {
  agentQuotaSelectors,
  type QuotaAccount,
  type QuotaBinding,
  type QuotaLatestReading,
  useAgentQuotaStore,
} from '@/store/agentQuota';

const styles = createStaticStyles(({ css }) => ({
  footer: css`
    margin-block-start: 4px;
    padding-block-start: 10px;
    border-block-start: 1px solid ${cssVar.colorBorderSecondary};
  `,
  hint: css`
    font-size: 12px;
    color: ${cssVar.colorTextTertiary};
  `,
  interactive: css`
    display: contents;
  `,
  radioGroup: css`
    width: 100%;

    > label {
      width: 100%;
    }

    > label > span:last-child {
      flex: 1;
      min-width: 0;
    }
  `,
  routing: css`
    padding-block: 6px;
    padding-inline: 10px;
    border-radius: ${cssVar.borderRadius};

    font-size: 12px;
    color: ${cssVar.colorTextSecondary};

    background: ${cssVar.colorFillQuaternary};
  `,
  row: css`
    padding-block: 6px;
    padding-inline: 4px;
    border-radius: ${cssVar.borderRadius};

    &:hover {
      background: ${cssVar.colorFillQuaternary};
    }

    &[data-off='true'] {
      opacity: 0.5;
    }
  `,
}));

type Account = QuotaAccount;
type Binding = QuotaBinding;
type QuotaReading = QuotaLatestReading;

const EMPTY_ACCOUNTS: Account[] = [];
const EMPTY_BINDINGS: Binding[] = [];

const AUTO = 'auto';

const clampPercent = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

/**
 * Weekly headroom for the account row. A reading whose window already rolled
 * over describes spend that has since refilled, so it counts as free rather
 * than as the last utilization it happened to record.
 */
const weeklyLeftOf = (readings: QuotaReading[], now = Date.now()): number | undefined => {
  const weekly = readings.find((r) => isWeeklyAllLimit(r));
  return weekly ? clampPercent(100 - currentUtilization(weekly, now)) : undefined;
};

const accountName = (a: Account) => a.label || a.email || a.externalAccountId;

/** Keeps one account's newest readings in sync while its row is listed. */
const AccountReadingsSync = memo<{ accountId: string }>(({ accountId }) => {
  const useFetchQuotaReadings = useAgentQuotaStore((s) => s.useFetchQuotaReadings);
  useFetchQuotaReadings(accountId);
  return null;
});

AccountReadingsSync.displayName = 'AccountReadingsSync';

const QuotaAccountManager = memo<{ agentId: string }>(({ agentId }) => {
  const { t } = useTranslation('chat');
  const [
    useFetchQuotaAccounts,
    useFetchQuotaBindings,
    bindQuotaAccount,
    renameQuotaAccount,
    switchQuotaAccount,
    unbindQuotaAccount,
  ] = useAgentQuotaStore((s) => [
    s.useFetchQuotaAccounts,
    s.useFetchQuotaBindings,
    s.bindQuotaAccount,
    s.renameQuotaAccount,
    s.switchQuotaAccount,
    s.unbindQuotaAccount,
  ]);
  const scope = cacheScope.use();
  const { error: accountsError } = useFetchQuotaAccounts();
  useFetchQuotaBindings(agentId);
  // A hydrated empty list may be an outdated snapshot: only the server's answer
  // (or a failed first read) settles "no accounts yet".
  const accountsConfirmed = useAgentQuotaStore(agentQuotaSelectors.isAccountsConfirmed(scope));
  // The replica paints the last-known pool on open; the server confirms behind it.
  const accounts = useAgentQuotaStore(agentQuotaSelectors.accounts) ?? EMPTY_ACCOUNTS;
  const loadedBindings = useAgentQuotaStore(agentQuotaSelectors.bindings(agentId));
  const bindings = loadedBindings ?? EMPTY_BINDINGS;
  // Until this agent's bindings are on screen, every row would read as "off"
  // and Auto as routing to nobody: keep the mode and per-account controls
  // disabled and show no routing hint instead of acting on that guess.
  const bindingsLoaded = loadedBindings !== undefined;
  // A hydrated row may be outdated (changed in another tab or on another
  // device): show it, but take writes only once the server confirmed it, so a
  // change is computed against the bindings the server actually holds.
  const bindingsConfirmed = useAgentQuotaStore(
    agentQuotaSelectors.isBindingsConfirmed(scope, agentId),
  );
  const canEditBindings = bindingsLoaded && bindingsConfirmed;
  const readingsMap = useAgentQuotaStore((s) => s.quotaReadingsMap);
  const weeklyById = useMemo(
    () =>
      Object.fromEntries(
        accounts.map((a) => {
          const readings = readingsMap[a.id];
          return [a.id, readings ? weeklyLeftOf(readings) : undefined] as const;
        }),
      ) as Record<string, number | undefined>,
    [accounts, readingsMap],
  );
  const [busy, setBusy] = useState(false);
  // Staged account selection — applied only when the user confirms.
  const [pending, setPending] = useState<string | null>(null);
  // Inline rename state (no nested modal).
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const roleOf = useCallback(
    (accountId: string) => bindings.find((b) => b.accountId === accountId)?.role,
    [bindings],
  );
  const bindingOf = useCallback(
    (accountId: string) => bindings.find((b) => b.accountId === accountId),
    [bindings],
  );
  const inRotation = useCallback(
    (accountId: string) => {
      const r = roleOf(accountId);
      return r === 'pinned' || r === 'pool';
    },
    [roleOf],
  );

  const pinnedId = bindings.find((b) => b.role === 'pinned')?.accountId;
  const current = pinnedId ?? AUTO;
  const selected = pending ?? current;
  const dirty = pending !== null && pending !== current;

  // Every write lands on the replica optimistically and re-reads its entry.
  const run = useCallback(async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }, []);

  // Preview which account Auto would route to (most weekly headroom in the pool).
  const routeId = useMemo(() => {
    if (selected !== AUTO) return null;
    const pool = accounts.filter((a) => inRotation(a.id));
    if (pool.length === 0) return null;
    return [...pool].sort((a, b) => (weeklyById[b.id] ?? 100) - (weeklyById[a.id] ?? 100))[0].id;
  }, [selected, accounts, inRotation, weeklyById]);
  const routeAccount = accounts.find((a) => a.id === routeId);

  const applySelection = useCallback(
    () =>
      run(async () => {
        const value = pending;
        if (value === null) return;
        if (value === AUTO) {
          if (pinnedId) await bindQuotaAccount(agentId, pinnedId, 'pool');
        } else {
          if (!bindings.some((b) => b.accountId === value)) {
            await bindQuotaAccount(agentId, value, 'pool');
          }
          await switchQuotaAccount(agentId, value);
        }
      }).then(() => setPending(null)),
    [agentId, bindQuotaAccount, bindings, pending, pinnedId, run, switchQuotaAccount],
  );

  const setRotation = useCallback(
    (accountId: string, next: boolean) =>
      run(() => bindQuotaAccount(agentId, accountId, next ? 'pool' : 'disabled')),
    [agentId, bindQuotaAccount, run],
  );

  const remove = useCallback(
    (accountId: string) => {
      // An unconfirmed (hydrated) binding id may already be gone on the server.
      const b = canEditBindings ? bindingOf(accountId) : undefined;
      if (!b) return;
      // Removing the account currently staged for switch cancels the stage.
      if (pending === accountId) setPending(null);
      return run(() => unbindQuotaAccount(agentId, b.id));
    },
    [agentId, bindingOf, canEditBindings, pending, run, unbindQuotaAccount],
  );

  const startEdit = useCallback((a: Account) => {
    setEditingId(a.id);
    setEditLabel(a.label ?? '');
  }, []);
  const saveEdit = useCallback(
    (accountId: string) =>
      run(() => renameQuotaAccount(accountId, editLabel.trim() || undefined)).then(() =>
        setEditingId(null),
      ),
    [editLabel, renameQuotaAccount, run],
  );

  const preventRadioSelection = useCallback((event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <Flexbox gap={2}>
      {accounts.map((a) => (
        <AccountReadingsSync accountId={a.id} key={a.id} />
      ))}
      <RadioGroup
        className={styles.radioGroup}
        gap={2}
        horizontal={false}
        // Which mode is active is unknown until the bindings are on screen. The
        // group mounts again once they are, so it starts controlled by the
        // confirmed mode instead of staying uncontrolled with nothing selected.
        key={bindingsLoaded ? 'bindings-loaded' : 'bindings-loading'}
        value={bindingsLoaded ? selected : undefined}
        options={[
          {
            disabled: busy || !canEditBindings,
            label: (
              <Flexbox className={styles.row} gap={4}>
                <Text style={{ fontSize: 13 }}>{t('heteroAgent.claudeQuota.manage.modeAuto')}</Text>
                {bindingsLoaded && selected === AUTO && (
                  <Flexbox horizontal align={'center'} className={styles.routing} gap={6}>
                    <Icon icon={ZapIcon} size={14} />
                    {routeAccount
                      ? t('heteroAgent.claudeQuota.manage.autoRoutingTo', {
                          account: accountName(routeAccount),
                        })
                      : t('heteroAgent.claudeQuota.manage.autoNoAccount')}
                  </Flexbox>
                )}
              </Flexbox>
            ),
            value: AUTO,
          },
          ...accounts.map((a) => {
            const rotate = inRotation(a.id);
            const weekly = weeklyById[a.id];
            const isEditing = editingId === a.id;
            const menuItems = [
              {
                icon: <Icon icon={PencilIcon} />,
                key: 'edit',
                label: t('heteroAgent.claudeQuota.manage.edit'),
                onClick: () => startEdit(a),
              },
              { type: 'divider' as const },
              {
                danger: true,
                disabled: !canEditBindings || !bindingOf(a.id),
                icon: <Icon icon={Trash2Icon} />,
                key: 'remove',
                label: t('heteroAgent.claudeQuota.manage.remove'),
                onClick: () => void remove(a.id),
              },
            ];

            return {
              disabled: busy || !canEditBindings || !rotate || isEditing,
              label: (
                <Flexbox
                  horizontal
                  align={'center'}
                  className={styles.row}
                  data-off={!rotate}
                  gap={8}
                >
                  {isEditing ? (
                    <>
                      <Input
                        autoFocus
                        size={'small'}
                        style={{ flex: 1 }}
                        value={editLabel}
                        placeholder={
                          a.email || t('heteroAgent.claudeQuota.manage.labelPlaceholder')
                        }
                        onChange={(e) => setEditLabel(e.target.value)}
                        onPressEnter={() => void saveEdit(a.id)}
                      />
                      <ActionIcon
                        disabled={busy}
                        icon={CheckIcon}
                        size={'small'}
                        onClick={() => void saveEdit(a.id)}
                      />
                      <ActionIcon icon={XIcon} size={'small'} onClick={() => setEditingId(null)} />
                    </>
                  ) : (
                    <>
                      <Flexbox flex={1} gap={0} style={{ minWidth: 0 }}>
                        <Flexbox horizontal align={'center'} gap={6} style={{ minWidth: 0 }}>
                          <Text ellipsis style={{ fontSize: 13 }}>
                            {accountName(a)}
                          </Text>
                          {a.planTier && (
                            <Text style={{ flex: 'none', fontSize: 12 }} type={'secondary'}>
                              {a.planTier}
                            </Text>
                          )}
                        </Flexbox>
                        {/* Only a real quota reading gets a subline; a disabled row is
                            conveyed by the dimmed state, and no-data shows nothing. */}
                        {rotate && weekly != null && (
                          <Text style={{ fontSize: 12 }} type={'secondary'}>
                            {weekly === 0
                              ? t('heteroAgent.claudeQuota.manage.exhausted')
                              : t('heteroAgent.claudeQuota.manage.weeklyLeft', {
                                  percent: weekly,
                                })}
                          </Text>
                        )}
                      </Flexbox>
                      <span className={styles.interactive} onClick={preventRadioSelection}>
                        <Switch
                          checked={rotate}
                          disabled={busy || !canEditBindings}
                          size={'small'}
                          onChange={(v) => void setRotation(a.id, v)}
                        />
                      </span>
                      <span className={styles.interactive} onClick={preventRadioSelection}>
                        <DropdownMenu items={menuItems} placement={'bottomRight'}>
                          <ActionIcon
                            icon={MoreHorizontalIcon}
                            size={'small'}
                            title={t('heteroAgent.claudeQuota.manage.more')}
                          />
                        </DropdownMenu>
                      </span>
                    </>
                  )}
                </Flexbox>
              ),
              value: a.id,
            };
          }),
        ]}
        onChange={setPending}
      />

      {accounts.length === 0 && (accountsConfirmed || !!accountsError) && (
        <Text className={styles.hint}>{t('heteroAgent.claudeQuota.manage.empty')}</Text>
      )}

      {dirty ? (
        <Flexbox horizontal className={styles.footer} gap={8} justify={'flex-end'}>
          <Button disabled={busy} onClick={() => setPending(null)}>
            {i18nT('cancel', { ns: 'common' })}
          </Button>
          <Button loading={busy} type={'primary'} onClick={() => void applySelection()}>
            {t('heteroAgent.claudeQuota.manage.confirmSwitch')}
          </Button>
        </Flexbox>
      ) : (
        <Text className={styles.hint} style={{ marginBlockStart: 4 }}>
          {t('heteroAgent.claudeQuota.manage.addHint')}
        </Text>
      )}
    </Flexbox>
  );
});

QuotaAccountManager.displayName = 'QuotaAccountManager';

/** Calling this opens the modal — `createModal` mounts immediately. */
export const openQuotaAccountManagerModal = (agentId: string): ModalInstance =>
  createModal({
    content: <QuotaAccountManager agentId={agentId} />,
    footer: null,
    title: i18nT('heteroAgent.claudeQuota.manage.title', { ns: 'chat' }),
    width: 460,
  });

export default QuotaAccountManager;
