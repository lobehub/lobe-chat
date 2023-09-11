import { BackBottom } from '@lobehub/ui';
import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import { usePluginStore } from '@/store/plugin';

import ChatList from './ChatList';
import ChatInput from './Input';
import ChatScrollAnchor from './ScrollAnchor';

const Conversation = memo<{ mobile?: boolean }>(({ mobile }) => {
  const ref = useRef(null);
  const { t } = useTranslation('common');

  const useFetchPluginList = usePluginStore((s) => s.useFetchPluginList);
  useFetchPluginList();

  return (
    <Flexbox flex={1} style={{ position: 'relative' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div ref={ref} style={{ height: '100%', overflowY: 'scroll' }}>
          {!mobile && <SafeSpacing />}
          <ChatList />
          <ChatScrollAnchor />
        </div>
        <BackBottom target={ref} text={t('backToBottom')} />
      </div>
      <ChatInput />
    </Flexbox>
  );
});

export default Conversation;
