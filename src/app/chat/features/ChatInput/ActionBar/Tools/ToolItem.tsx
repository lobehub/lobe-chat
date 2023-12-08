import { Checkbox, Tag } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { useToolStore } from '@/store/tool';
import { customPluginSelectors } from '@/store/tool/selectors';

const ToolItem = memo<{ identifier: string; label: string }>(({ identifier, label }) => {
  const { t } = useTranslation('plugin');
  const [checked, togglePlugin] = useSessionStore((s) => [
    agentSelectors.currentAgentPlugins(s).includes(identifier),
    s.togglePlugin,
  ]);

  const isCustom = useToolStore((s) => customPluginSelectors.isCustomPlugin(identifier)(s));

  return (
    <Flexbox
      gap={40}
      horizontal
      justify={'space-between'}
      onClick={(e) => {
        e.stopPropagation();
        togglePlugin(identifier);
      }}
      padding={'8px 12px'}
    >
      <Flexbox align={'center'} gap={8} horizontal>
        {label}
        {isCustom && (
          <Tag bordered={false} color={'gold'}>
            {t('list.item.local.title')}
          </Tag>
        )}
      </Flexbox>
      <Checkbox
        checked={checked}
        onClick={(e) => {
          e.stopPropagation();
          togglePlugin(identifier);
        }}
      />
    </Flexbox>
  );
});

export default ToolItem;
