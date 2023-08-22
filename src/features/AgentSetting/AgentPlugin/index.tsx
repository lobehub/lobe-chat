import { Avatar, Form, ItemGroup } from '@lobehub/ui';
import { Skeleton, Switch } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ToyBrick } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { usePluginStore } from '@/store/plugin';
import { AgentAction } from '@/store/session/slices/agentConfig';
import { LobeAgentConfig } from '@/types/session';

const useStyles = createStyles(({ css }) => ({
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
}));

export interface AgentPluginProps {
  config: LobeAgentConfig;
  updateConfig: AgentAction['toggleAgentPlugin'];
}

const AgentPlugin = memo<AgentPluginProps>(({ config, updateConfig }) => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();
  const [useFetchPluginList, fetchPluginManifest] = usePluginStore((s) => [
    s.useFetchPluginList,
    s.fetchPluginManifest,
  ]);
  const pluginManifestLoading = usePluginStore((s) => s.pluginManifestLoading, isEqual);
  const { data } = useFetchPluginList();

  const plugin: ItemGroup = useMemo(() => {
    let children;

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

    children = !data
      ? [loadingItem, loadingItem, loadingItem]
      : data.plugins.map((item) => ({
          avatar: <Avatar avatar={item.meta.avatar} />,
          children: (
            <Switch
              checked={
                // 如果在加载中，说明激活了
                pluginManifestLoading[item.name] || !config.plugins
                  ? false
                  : config.plugins.includes(item.name)
              }
              loading={pluginManifestLoading[item.name]}
              onChange={(checked) => {
                updateConfig(item.name, checked);
                if (checked) {
                  fetchPluginManifest(item.name);
                }
              }}
            />
          ),
          desc: item.meta?.description,
          label: t(`plugins.${item.name}` as any, { ns: 'plugin' }),
          minWidth: undefined,
          tag: item.name,
        }));

    return {
      children,
      icon: ToyBrick,
      title: t('settingPlugin.title'),
    };
  }, [config, data?.plugins, pluginManifestLoading]);

  return <Form items={[plugin]} {...FORM_STYLE} />;
});

export default AgentPlugin;
