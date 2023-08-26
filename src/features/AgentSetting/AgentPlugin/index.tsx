import { Avatar, Form, ItemGroup, Markdown } from '@lobehub/ui';
import { Skeleton, Switch } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { LucideStore, ToyBrick } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { transformPluginSettings } from '@/features/PluginSettings';
import PluginSettingRender from '@/features/PluginSettings/PluginSettingRender';
import { pluginHelpers, usePluginStore } from '@/store/plugin';
import { useSessionStore } from '@/store/session';
import { AgentAction, agentSelectors } from '@/store/session/slices/agentConfig';
import { LobeAgentConfig } from '@/types/session';

const useStyles = createStyles(({ css, token }) => ({
  avatar: css`
    .ant-skeleton-header {
      padding-right: 0;
    }
  `,
  label: css`
    li {
      height: 14px !important;
    }

    li + li {
      margin-block-start: 12px !important;
    }
  `,
  md: css`
    p {
      color: ${token.colorTextDescription};
    }
  `,
}));

export interface AgentPluginProps {
  config: LobeAgentConfig;
  updateConfig: AgentAction['toggleAgentPlugin'];
}

const AgentPlugin = memo<AgentPluginProps>(({ config, updateConfig }) => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();
  const [useFetchPluginList, fetchPluginManifest, updatePluginSettings] = usePluginStore((s) => [
    s.useFetchPluginList,
    s.fetchPluginManifest,
    s.updatePluginSettings,
  ]);
  const pluginManifestLoading = usePluginStore((s) => s.pluginManifestLoading, isEqual);
  const pluginManifestMap = usePluginStore((s) => s.pluginManifestMap, isEqual);
  const pluginsSettings = usePluginStore((s) => s.pluginsSettings, isEqual);
  const { data } = useFetchPluginList();

  const plugins = useSessionStore(agentSelectors.currentAgentPlugins);

  const loadingItem = {
    avatar: (
      <Skeleton
        active
        avatar={{ size: 40 }}
        className={styles.avatar}
        paragraph={false}
        title={false}
      />
    ),
    label: (
      <Skeleton
        active
        avatar={false}
        paragraph={{ className: styles.label, style: { marginBottom: 0 } }}
        style={{ width: 300 }}
        title={false}
      />
    ),
  };

  const children = !data
    ? [loadingItem, loadingItem, loadingItem]
    : data.plugins.map(({ identifier, meta }) => ({
        avatar: <Avatar avatar={meta.avatar} />,
        children: (
          <Switch
            checked={
              // 如果在加载中，说明激活了
              pluginManifestLoading[identifier] || !config.plugins
                ? false
                : config.plugins.includes(identifier)
            }
            loading={pluginManifestLoading[identifier]}
            onChange={(checked) => {
              updateConfig(identifier, checked);
              if (checked) {
                fetchPluginManifest(identifier);
              }
            }}
          />
        ),
        desc: pluginHelpers.getPluginDesc(meta),
        label: pluginHelpers.getPluginTitle(meta),
        minWidth: undefined,
        tag: identifier,
      }));

  const pluginsConfig = !data
    ? []
    : (plugins
        .map((identifier) => {
          const item = data.plugins.find((i) => i.identifier === identifier);

          if (!item) return null;
          const manifest = pluginManifestMap[identifier];

          if (!manifest.settings) return null;

          return {
            children: transformPluginSettings(manifest.settings).map((item) => ({
              ...item,
              children: (
                <PluginSettingRender
                  defaultValue={pluginsSettings[identifier]?.[item.name]}
                  format={item.format}
                  onChange={(value) => {
                    updatePluginSettings(identifier, { [item.name]: value });
                  }}
                  type={item.type as any}
                />
              ),
              desc: item.desc && <Markdown className={styles.md}>{item.desc}</Markdown>,
            })),
            icon: ToyBrick,
            title: t('settingPlugin.config', { id: pluginHelpers.getPluginTitle(item.meta) }),
          };
        })
        .filter(Boolean) as unknown as ItemGroup[]);

  return (
    <Form
      items={[
        {
          children,
          icon: LucideStore,
          title: t('settingPlugin.title'),
        },
        ...pluginsConfig,
      ]}
      {...FORM_STYLE}
    />
  );
});

export default AgentPlugin;
