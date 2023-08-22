import { Avatar, Form, ItemGroup } from '@lobehub/ui';
import { useWhyDidYouUpdate } from 'ahooks';
import { Skeleton, Switch } from 'antd';
import { createStyles } from 'antd-style';
import { ToyBrick } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useSessionStore } from '@/store/session';
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
  const useFetchPluginList = useSessionStore((s) => s.useFetchPluginList);
  const { data } = useFetchPluginList();

  useWhyDidYouUpdate('AgentPlugin', { config, updateConfig });

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
              checked={!config.plugins ? false : config.plugins.includes(item.name)}
              onChange={() => updateConfig(item.name)}
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
  }, [config, data?.plugins]);

  return <Form items={[plugin]} {...FORM_STYLE} />;
});

export default AgentPlugin;
