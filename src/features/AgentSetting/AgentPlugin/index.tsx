import { Avatar, Form, ItemGroup } from '@lobehub/ui';
import { Switch } from 'antd';
import { ToyBrick } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { PluginsMap } from '@/plugins';
import { AgentAction } from '@/store/session/slices/agentConfig';
import { LobeAgentConfig } from '@/types/session';

export interface AgentPluginProps {
  config: LobeAgentConfig;
  updateConfig: AgentAction['toggleAgentPlugin'];
}

const AgentPlugin = memo<AgentPluginProps>(({ config, updateConfig }) => {
  const { t } = useTranslation('setting');

  const plugin: ItemGroup = useMemo(
    () => ({
      children: Object.values(PluginsMap).map((item) => ({
        avatar: <Avatar avatar={item.avatar} />,
        children: (
          <Switch
            checked={!config.plugins ? false : config.plugins.includes(item.name)}
            onChange={() => updateConfig(item.name)}
          />
        ),
        desc: item.schema.description,
        label: t(`plugins.${item.name}` as any, { ns: 'plugin' }),
        minWidth: undefined,
        tag: item.name,
      })),
      icon: ToyBrick,
      title: t('settingPlugin.title'),
    }),
    [config],
  );

  return <Form items={[plugin]} {...FORM_STYLE} />;
});

export default AgentPlugin;
