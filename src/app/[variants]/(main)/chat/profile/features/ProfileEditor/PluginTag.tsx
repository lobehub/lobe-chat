'use client';

import { Avatar, Tag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { AlertCircle, X } from 'lucide-react';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import PluginAvatar from '@/components/Plugins/PluginAvatar';
import { useDiscoverStore } from '@/store/discover';
import { useToolStore } from '@/store/tool';
import { builtinToolSelectors, pluginSelectors } from '@/store/tool/selectors';

const useStyles = createStyles(({ css, token }) => ({
  notInstalledTag: css`
    border-color: ${token.colorWarningBorder};
    background: ${token.colorWarningBg};
  `,
  tag: css`
    height: 28px !important;
    border-radius: ${token.borderRadiusSM}px !important;
  `,
  warningIcon: css`
    flex-shrink: 0;
    color: ${token.colorWarning};
  `,
}));

interface PluginTagProps {
  onRemove: (e: React.MouseEvent) => void;
  pluginId: string | { enabled: boolean; identifier: string; settings: Record<string, any> };
}

const PluginTag = memo<PluginTagProps>(({ pluginId, onRemove }) => {
  const { styles, theme } = useStyles();
  const { t } = useTranslation('setting');

  // Extract identifier
  const identifier = typeof pluginId === 'string' ? pluginId : pluginId?.identifier;

  // Get local plugin lists
  const builtinList = useToolStore(builtinToolSelectors.metaList, isEqual);
  const installedPluginList = useToolStore(pluginSelectors.installedPluginMetaList, isEqual);

  // Check if plugin is installed
  const isInstalled = useToolStore(pluginSelectors.isPluginInstalled(identifier));

  // Try to find in local lists first
  const localMeta = useMemo(() => {
    const builtinMeta = builtinList.find((p) => p.identifier === identifier);
    if (builtinMeta) {
      return {
        avatar: builtinMeta.meta.avatar,
        isInstalled: true,
        title: builtinMeta.meta.title,
        type: 'builtin' as const,
      };
    }

    const installedMeta = installedPluginList.find((p) => p.identifier === identifier);
    if (installedMeta) {
      return {
        avatar: installedMeta.avatar,
        isInstalled: true,
        title: installedMeta.title,
        type: 'plugin' as const,
      };
    }

    return null;
  }, [identifier, builtinList, installedPluginList]);

  // Fetch from remote if not found locally
  const usePluginDetail = useDiscoverStore((s) => s.usePluginDetail);
  const { data: remoteData, isLoading } = usePluginDetail({
    identifier: !localMeta && !isInstalled ? identifier : undefined,
    withManifest: false,
  });

  // Determine final metadata
  const meta = localMeta || {
    avatar: remoteData?.avatar,
    isInstalled: false,
    title: remoteData?.title || identifier,
    type: 'plugin' as const,
  };

  const displayTitle = isLoading ? 'Loading...' : meta.title;

  return (
    <Tag
      className={styles.tag}
      closable
      closeIcon={<X size={12} />}
      color={meta.isInstalled ? undefined : 'error'}
      icon={
        !meta.isInstalled ? (
          <AlertCircle className={styles.warningIcon} size={14} />
        ) : meta.avatar && meta?.type === 'builtin' ? (
          <Avatar avatar={meta.avatar} shape={'square'} size={16} style={{ flexShrink: 0 }} />
        ) : (
          <PluginAvatar avatar={meta.avatar} size={16} />
        )
      }
      onClose={onRemove}
      title={meta.isInstalled ? undefined : t('tools.notInstalledWarning')}
      variant={theme.isDarkMode ? 'filled' : 'outlined'}
    >
      {!meta.isInstalled ? `${displayTitle} (${t('tools.notInstalled')})` : displayTitle}
    </Tag>
  );
});

PluginTag.displayName = 'PluginTag';

export default PluginTag;
