import { BackBottom } from '@lobehub/ui';
import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import HeaderSpacing from '@/components/HeaderSpacing';

import ChatList from './ChatList';
import ChatInput from './Input';

const Conversation = () => {
  const ref = useRef(null);
  const { t } = useTranslation('common');
  return (
    <Flexbox flex={1} style={{ position: 'relative' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div ref={ref} style={{ height: '100%', overflowY: 'scroll' }}>
          <HeaderSpacing />
          <ChatList />
        </div>
        <BackBottom target={ref} text={t('backToBottom')} />
      </div>
      <ChatInput />
    </Flexbox>
  );
};

export default memo(Conversation);
