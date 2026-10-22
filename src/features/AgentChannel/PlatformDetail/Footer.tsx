'use client';

import { Alert, Button, Flexbox, Tag } from '@lobehub/ui';
import { type FormInstance, useWatch } from '@lobehub/ui/form';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { RefreshCw, Trash2 } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useAppOrigin } from '@/hooks/useAppOrigin';
import type { SerializedPlatformDefinition } from '@/server/services/bot/platforms/types';

import type { ChannelFormValues, CurrentConfig, TestResult } from './index';

const styles = stylex.create({
  actionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlockStart: '16px',
  },
  bottom: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    maxWidth: '1024px',
  },
  resultDetail: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: cssVar.colorTextTertiary,
    wordBreak: 'break-all',
  },
  webhookBox: {
    overflow: 'hidden',
    flex: '1',
    height: cssVar.controlHeight,
    paddingInline: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: cssVar.colorBorder,
    borderRadius: cssVar.borderRadius,
    fontFamily: 'monospace',
    fontSize: '13px',
    lineHeight: cssVar.controlHeight,
    color: cssVar.colorTextSecondary,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    backgroundColor: cssVar.colorFillQuaternary,
    backgroundImage: 'none',
  },
});

/**
 * Error body of a result banner: one readable sentence, with the raw platform
 * message folded behind a "show details" toggle so it stays available for
 * diagnosis without being dumped into the banner.
 */
const ResultDetail = memo<{ detail?: string; hint: string }>(({ detail, hint }) => {
  const { t } = useTranslation('agent');
  const [open, setOpen] = useState(false);
  if (!detail || detail === hint) return <>{hint}</>;
  return (
    <Flexbox align={'flex-start'} gap={4}>
      <span>{hint}</span>
      <Button size={'small'} type={'text'} onClick={() => setOpen((value) => !value)}>
        {open ? t('channel.resultDetail.hide') : t('channel.resultDetail.show')}
      </Button>
      {open && <span {...stylex.props(styles.resultDetail)}>{detail}</span>}
    </Flexbox>
  );
});

ResultDetail.displayName = 'ResultDetail';

interface FooterProps {
  connecting: boolean;
  connectResult?: TestResult;
  currentConfig?: CurrentConfig;
  disabled?: boolean;
  form: FormInstance<ChannelFormValues>;
  hasConfig: boolean;
  isDirty: boolean;
  onCopied: () => void;
  onDelete: () => void;
  onDiscard: () => void;
  onSave: () => void;
  onTestConnection: () => void;
  platformDef: SerializedPlatformDefinition;
  saveResult?: TestResult;
  saving: boolean;
  testing: boolean;
  testResult?: TestResult;
  writeDisabled?: boolean;
}

const Footer = memo<FooterProps>(
  ({
    platformDef,
    currentConfig,
    form,
    hasConfig,
    isDirty,
    connectResult,
    connecting,
    disabled,
    saveResult,
    saving,
    testing,
    testResult,
    writeDisabled,
    onSave,
    onDelete,
    onDiscard,
    onTestConnection,
    onCopied,
  }) => {
    const { t } = useTranslation('agent');
    const origin = useAppOrigin();
    const platformId = platformDef.id;
    const applicationId = useWatch(form, 'applicationId');

    const settingsConnectionMode = useWatch(form, 'settings.connectionMode');

    const showWebhookUrl = platformDef.showWebhookUrl || settingsConnectionMode === 'webhook';

    // Strong reminder when an already-saved bot is missing the operator's
    // User ID. Without it, AI tools can't push notifications back to the
    // operator and the pairing approver identity is undefined. Skipped on
    // first-time config and on platforms whose schema doesn't expose
    // `userId` (e.g. WeChat, which auto-manages identity via QR).
    const hasUserIdField = useMemo(() => {
      const settings = platformDef.schema.find((f) => f.key === 'settings');
      return settings?.properties?.some((f) => f.key === 'userId') ?? false;
    }, [platformDef.schema]);
    const watchedUserId = useWatch(form, 'settings.userId');
    // `useWatch` returns `undefined` until the form hydrates from the
    // parent's `initialValues`. Fall back to the saved value only during
    // that pre-hydration window so we don't flash the alert for every
    // saved bot. Once the form has reported a value, trust the watched
    // value — including `undefined`, so "Reset to Default" (which clears
    // settings.userId) correctly re-surfaces the alert.
    const savedUserId = currentConfig?.settings?.userId;
    const [formHydrated, setFormHydrated] = useState(false);
    useEffect(() => {
      if (watchedUserId !== undefined) setFormHydrated(true);
    }, [watchedUserId]);
    const effectiveUserId = formHydrated ? watchedUserId : savedUserId;
    const userIdMissing =
      hasConfig &&
      hasUserIdField &&
      !(typeof effectiveUserId === 'string' && effectiveUserId.trim());

    const webhookUrl = applicationId
      ? `${origin}/api/agent/webhooks/${platformId}/${applicationId}`
      : `${origin}/api/agent/webhooks/${platformId}`;

    return (
      <div {...stylex.props(styles.bottom)}>
        <div {...stylex.props(styles.actionBar)}>
          {hasConfig ? (
            <Button
              danger
              disabled={disabled || saving || connecting}
              icon={<Trash2 size={16} />}
              onClick={onDelete}
            >
              {t('channel.removeChannel')}
            </Button>
          ) : (
            <div />
          )}
          <Flexbox horizontal gap={12}>
            {hasConfig && (
              <Button
                disabled={writeDisabled || saving || connecting}
                icon={<RefreshCw size={16} />}
                loading={testing}
                onClick={onTestConnection}
              >
                {t('channel.testConnection')}
              </Button>
            )}
            {isDirty && (
              <Button disabled={writeDisabled || saving || connecting} onClick={onDiscard}>
                {t('channel.discard')}
              </Button>
            )}
            <Button
              disabled={writeDisabled}
              loading={saving || connecting}
              type="primary"
              onClick={onSave}
            >
              {connecting ? t('channel.connecting') : t('channel.save')}
            </Button>
          </Flexbox>
        </div>

        {saveResult && (
          <Alert
            closable
            showIcon
            title={saveResult.type === 'success' ? t('channel.saved') : t('channel.saveFailed')}
            type={saveResult.type}
            description={
              saveResult.type === 'error' ? (
                <ResultDetail
                  detail={saveResult.errorDetail}
                  hint={saveResult.hint || t('channel.saveFailedHint')}
                />
              ) : undefined
            }
          />
        )}

        {connectResult && (
          <Alert
            closable
            showIcon
            type={connectResult.type}
            description={
              connectResult.type === 'error' ? (
                <ResultDetail
                  detail={connectResult.errorDetail}
                  hint={connectResult.hint || t('channel.connectFailedHint')}
                />
              ) : undefined
            }
            title={
              connectResult.title ||
              (connectResult.type === 'success'
                ? t('channel.connectSuccess')
                : t('channel.connectFailed'))
            }
          />
        )}

        {testResult && (
          <Alert
            closable
            showIcon
            type={testResult.type}
            description={
              testResult.type === 'error' ? (
                <ResultDetail
                  detail={testResult.errorDetail}
                  hint={testResult.hint || t('channel.testFailedHint')}
                />
              ) : undefined
            }
            title={
              testResult.type === 'success' ? t('channel.testSuccess') : t('channel.testFailed')
            }
          />
        )}

        {userIdMissing && (
          <Alert
            closable
            showIcon
            description={t('channel.userIdMissingDesc')}
            message={t('channel.userIdMissingTitle')}
            type="info"
          />
        )}

        {hasConfig && showWebhookUrl && platformId === 'qq' && (
          <Alert
            closable
            showIcon
            description={t('channel.qq.webhookMigrationDesc')}
            message={t('channel.qq.webhookMigrationTitle')}
            type="info"
          />
        )}

        {hasConfig && showWebhookUrl && platformId === 'slack' && (
          <Alert
            closable
            showIcon
            description={t('channel.slack.webhookMigrationDesc')}
            message={t('channel.slack.webhookMigrationTitle')}
            type="info"
          />
        )}

        {hasConfig && showWebhookUrl && (platformId === 'feishu' || platformId === 'lark') && (
          <Alert
            closable
            showIcon
            description={t('channel.feishu.webhookMigrationDesc')}
            message={t('channel.feishu.webhookMigrationTitle')}
            type="info"
          />
        )}

        {hasConfig && showWebhookUrl && (
          <Flexbox gap={8}>
            <Flexbox horizontal align="center" gap={8}>
              <span style={{ fontWeight: 600 }}>{t('channel.endpointUrl')}</span>
              <Tag>{'Event Subscription URL'}</Tag>
            </Flexbox>
            <Flexbox horizontal gap={8}>
              <div {...stylex.props(styles.webhookBox)}>{webhookUrl}</div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  onCopied();
                }}
              >
                {t('channel.copy')}
              </Button>
            </Flexbox>
            <Alert
              showIcon
              type="info"
              message={
                <Trans<'channel.endpointUrlHint', 'agent'>
                  components={{ bold: <strong /> }}
                  i18nKey="channel.endpointUrlHint"
                  ns="agent"
                  values={{ fieldName: 'Event Subscription URL', name: platformDef.name }}
                />
              }
            />
          </Flexbox>
        )}
      </div>
    );
  },
);

export default Footer;
