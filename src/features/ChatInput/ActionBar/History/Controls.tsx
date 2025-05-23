import { Form, type FormItemProps, SliderWithInput } from '@lobehub/ui';
import { Switch } from 'antd';
import { debounce } from 'lodash-es';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';

interface ControlsProps {
  setUpdating: (updating: boolean) => void;
  updating: boolean;
}
const Controls = memo<ControlsProps>(({ updating, setUpdating }) => {
  const { t } = useTranslation('setting');

  const [historyCount, enableHistoryCount, updateAgentConfig] = useAgentStore((s) => {
    return [
      agentChatConfigSelectors.historyCount(s),
      agentChatConfigSelectors.enableHistoryCount(s),
      s.updateAgentChatConfig,
    ];
  });

  let items: FormItemProps[] = [
    {
      children: <Switch loading={updating} size={'small'} />,
      label: t('settingChat.enableHistoryCount.title'),
      layout: 'horizontal',
      minWidth: undefined,
      name: 'enableHistoryCount',
      valuePropName: 'checked',
    },
    {
      children: (
        <SliderWithInput
          disabled={!enableHistoryCount}
          max={20}
          min={0}
          size={'small'}
          step={1}
          style={{ marginBlock: 8, paddingLeft: 4 }}
          styles={{
            input: {
              maxWidth: 64,
            },
          }}
          unlimitedInput={true}
        />
      ),
      name: 'historyCount',
      noStyle: true,
    },
  ];

  return (
    <Form
      initialValues={{
        enableHistoryCount,
        historyCount,
      }}
      items={items}
      itemsType={'flat'}
      onValuesChange={debounce(async (values) => {
        setUpdating(true);
        await updateAgentConfig(values);
        setUpdating(false);
      }, 500)}
      styles={{
        group: {
          background: 'transparent',
        },
      }}
    />
  );
});

export default Controls;
