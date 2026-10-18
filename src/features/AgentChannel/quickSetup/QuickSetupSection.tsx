'use client';

import { createStaticStyles, cssVar, Flexbox, Text } from '@lobehub/ui';
import { Form, type FormInstance, useWatch } from '@lobehub/ui/form';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import FeishuQuickCreate, { type FeishuCreatedApp } from './FeishuQuickCreate';
import { getSetupGuide } from './guides';
import { toRegistrationName } from './links';
import SetupGuide from './SetupGuide';

// Same quiet group heading as the form's Advanced Settings.
const styles = createStaticStyles(({ css }) => ({
  group: css`
    border-block-end: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 0 !important;
  `,
  title: css`
    font-size: 13px;
    font-weight: 400;
    line-height: 1.4;
    color: ${cssVar.colorTextSecondary};
  `,
}));

interface QuickSetupSectionProps {
  /** Name the created app / Slack manifest starts with (the agent's name). */
  appName: string;
  disabled?: boolean;
  // Only reads `applicationId`; any channel form shape works.
  form: FormInstance<any>;
  hasConfig?: boolean;
  /** Saves and connects the credentials; resolves `false` when saving failed. */
  onAuthenticated?: (params: {
    applicationId: string;
    credentials: Record<string, string>;
  }) => Promise<boolean> | void;
  platformId: string;
  /** Who the created app is for (the agent id); a new scope starts a new scan. */
  scope?: string;
}

/**
 * Top of a channel's credential form: Feishu / Lark create the bot app from
 * one scan (saved and connected through `onAuthenticated`), and every platform
 * gets its setup steps with links straight to the right console page.
 */
const QuickSetupSection = memo<QuickSetupSectionProps>(
  ({ appName, disabled, form, hasConfig, onAuthenticated, platformId, scope }) => {
    const { t } = useTranslation('agent');
    const applicationId = useWatch(form, (values) => values?.applicationId as string | undefined);
    const guide = useMemo(
      () => getSetupGuide(platformId, { applicationId, appName }),
      [platformId, applicationId, appName],
    );
    if (!guide) return null;

    const canScan = guide.scanToCreate && !hasConfig && !disabled && !!onAuthenticated;

    // Throws when the app can't be saved here, so the scan keeps its credentials.
    const handleCreated = async ({ appId, appSecret, brand }: FeishuCreatedApp) => {
      if (brand !== platformId)
        throw new Error(t(`channel.quickSetup.feishu.scan.brandMismatch.${brand}`));
      const saved = await onAuthenticated?.({ applicationId: appId, credentials: { appSecret } });
      if (saved === false) throw new Error(t('channel.quickSetup.feishu.scan.saveFailed'));
    };

    return (
      <>
        {canScan && (
          <Flexbox gap={12} style={{ padding: '16px 0' }}>
            {/* Keyed so another agent or platform never inherits this scan. */}
            <FeishuQuickCreate
              appPreset={{ name: toRegistrationName(appName) }}
              key={`${scope ?? ''}:${platformId}`}
              platform={platformId as 'feishu' | 'lark'}
              scope={scope}
              onCreated={handleCreated}
            />
            <Text fontSize={12} style={{ color: cssVar.colorTextTertiary }}>
              {t('channel.quickSetup.manualToggle')}
            </Text>
          </Flexbox>
        )}
        <Form.Group
          collapsible
          className={styles.group}
          defaultActive={!hasConfig && !guide.scanToCreate}
          keyValue={`setup-guide-${platformId}`}
          variant={'borderless'}
          title={
            <Text as={'span'} className={styles.title}>
              {t('channel.quickSetup.guideTitle')}
            </Text>
          }
        >
          <div style={{ padding: '8px 0 16px' }}>
            <SetupGuide guide={guide} />
          </div>
        </Form.Group>
      </>
    );
  },
);

QuickSetupSection.displayName = 'ChannelQuickSetupSection';

export default QuickSetupSection;
