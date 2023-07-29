import { Avatar, Form, ItemGroup } from '@lobehub/ui';
import { Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { ToyBrick } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import { FORM_STYLE } from '@/const/layoutTokens';
import { PluginsMap } from '@/plugins';
import { agentSelectors, useSessionStore } from '@/store/session';

const PluginList = () => {
  const { t } = useTranslation('setting');

  const config = useSessionStore(agentSelectors.currentAgentConfigSafe, isEqual);

  const toggleAgentPlugin = useSessionStore((s) => s.toggleAgentPlugin, shallow);

  const plugin: ItemGroup = useMemo(
    () => ({
      children: Object.values(PluginsMap).map((item) => ({
        avatar: <Avatar avatar={item.avatar} />,
        children: (
          <Switch
            checked={!config.plugins ? false : config.plugins.includes(item.name)}
            onChange={() => toggleAgentPlugin(item.name)}
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
};

export default PluginList;
