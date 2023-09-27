import { BackBottom } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import { usePluginStore } from '@/store/plugin';

import ChatList from './ChatList';
import ChatInput from './Input';
import ChatScrollAnchor from './ScrollAnchor';

const useStyles = createStyles(
  ({ css, responsive, stylish }) => css`
    overflow-x: hidden;
    overflow-y: scroll;
    height: 100%;
    ${responsive.mobile} {
      ${stylish.noScrollbar}
      width: 100vw;
    }
  `,
);

const Conversation = memo<{ mobile?: boolean }>(({ mobile }) => {
  const ref = useRef(null);
  const { t } = useTranslation('common');
  const { styles } = useStyles();

  const useFetchPluginList = usePluginStore((s) => s.useFetchPluginList);
  useFetchPluginList();

  return (
    <Flexbox flex={1} style={{ position: 'relative' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div className={styles} ref={ref}>
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
