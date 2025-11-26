'use client';

import { Avatar } from '@lobehub/ui';
import { Tag, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { AlertCircle, X } from 'lucide-react';
import React, { memo, useMemo } from 'react';

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
    display: flex;
    gap: 8px;
    align-items: center;
    margin: 0;
  `,
  tagContent: css`
    overflow: hidden;
    display: flex;
    gap: 8px;
    align-items: center;

    max-width: 150px;
    height: 26px;
  `,
  tagText: css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
  const { styles } = useStyles();

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

  // Tooltip message - show warning for uninstalled plugins
  const tooltipTitle = !meta.isInstalled
    ? '当前插件暂未安装，可能会影响当前 Agent 的使用'
    : displayTitle;

  const tagContent = (
    <Tag
      className={`${styles.tag} ${!meta.isInstalled ? styles.notInstalledTag : ''}`}
      closeIcon={<X size={12} />}
      icon={
        !meta.isInstalled ? <AlertCircle className={styles.warningIcon} size={14} /> : undefined
      }
      onClose={onRemove}
    >
      <div className={styles.tagContent}>
        {meta.avatar && (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>
            {meta?.type === 'builtin' ? (
              <Avatar avatar={meta.avatar} size={16} style={{ flexShrink: 0 }} />
            ) : (
              <PluginAvatar avatar={meta.avatar} size={16} />
            )}
          </>
        )}
        <span className={styles.tagText}>{displayTitle}</span>
      </div>
    </Tag>
  );

  return <Tooltip title={tooltipTitle}>{tagContent}</Tooltip>;
});

PluginTag.displayName = 'PluginTag';

export default PluginTag;
