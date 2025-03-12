import { ActionIcon, SliderWithInput } from '@lobehub/ui';
import { Popover, Switch } from 'antd';
import { Timer, TimerOff } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';

const History = memo(() => {
  const { t } = useTranslation('setting');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [historyCount, enableHistoryCount, updateAgentConfig] = useAgentStore((s) => {
    return [
      agentChatConfigSelectors.historyCount(s),
      agentChatConfigSelectors.enableHistoryCount(s),
      s.updateAgentChatConfig,
    ];
  });

  const title = t(
    enableHistoryCount
      ? 'settingChat.enableHistoryCount.limited'
      : 'settingChat.enableHistoryCount.unlimited',
    { number: historyCount || 0 },
  );
  const mobile = useIsMobile();

  return (
    <Popover
      arrow={false}
      content={
        <Flexbox align={'center'} gap={16} horizontal>
          <SliderWithInput
            disabled={!enableHistoryCount}
            max={20}
            min={0}
            onChange={(v) => {
              updateAgentConfig({ historyCount: v });
            }}
            step={1}
            style={{ width: mobile ? 160 : 300 }}
            value={historyCount}
          />
        </Flexbox>
      }
      onOpenChange={setPopoverOpen}
      open={popoverOpen}
      placement={'top'}
      title={
        <Flexbox align={'center'} gap={4} horizontal>
          <Switch
            checked={enableHistoryCount}
            onChange={(enableHistoryCount) => {
              updateAgentConfig({ enableHistoryCount });
            }}
            size={'small'}
          />
          {t('settingChat.enableHistoryCount.title')}
        </Flexbox>
      }
      trigger={'click'}
    >
      <ActionIcon
        icon={enableHistoryCount ? Timer : TimerOff}
        placement={'bottom'}
        title={popoverOpen ? undefined : title}
      />
    </Popover>
  );
});

export default History;
