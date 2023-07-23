import { Avatar } from '@lobehub/ui';
import { List, Switch, Tag } from 'antd';
import isEqual from 'fast-deep-equal';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import pluginList from '@/plugins';
import { agentSelectors, useSessionStore } from '@/store/session';

const PluginList = () => {
  const { t } = useTranslation('common');

  const config = useSessionStore(agentSelectors.currentAgentConfigSafe, isEqual);

  const [toggleAgentPlugin] = useSessionStore((s) => [s.toggleAgentPlugin], shallow);

  return (
    <List
      bordered
      dataSource={pluginList}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar avatar={item.avatar} />}
            description={item.schema.description}
            title={
              <Flexbox align={'center'} gap={8} horizontal>
                {t(`plugin-${item.name}` as any)} <Tag>{item.name}</Tag>
              </Flexbox>
            }
          />
          <Switch
            checked={!config.plugins ? false : config.plugins.includes(item.name)}
            onChange={() => {
              toggleAgentPlugin(item.name);
            }}
          />
        </List.Item>
      )}
      size={'large'}
    />
  );
};

export default PluginList;
