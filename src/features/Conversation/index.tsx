import { BackBottom } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ReactNode, memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';

import ChatScrollAnchor from './components/ScrollAnchor';
import SkeletonList from './components/SkeletonList';
import ChatList from './components/VirtualizedList';
import { useInitConversation } from './hooks/useInitConversation';

const useStyles = createStyles(({ css, responsive, stylish, cx }, fontSize: number = 14) =>
  cx(
    css`
      position: relative;
      height: 100%;

      ${responsive.mobile} {
        ${stylish.noScrollbar}
        width: 100vw;
      }
    `,
    fontSize !== 14 &&
      css`
        article[data-code-type='markdown'] {
          p,
          code,
          pre,
          ul,
          ol,
          li,
          blockquote {
            font-size: ${fontSize}px;
          }
        }
      `,
  ),
);

interface ConversationProps {
  chatInput: ReactNode;
}

const Conversation = memo<ConversationProps>(({ chatInput }) => {
  const ref = useRef(null);
  const { t } = useTranslation('chat');
  const fontSize = useGlobalStore((s) => settingsSelectors.currentSettings(s).fontSize);
  const { styles } = useStyles(fontSize);

  // init conversation
  const init = useInitConversation();

  return (
    <Flexbox data-id={'conversation'} flex={1}>
      <div className={styles} ref={ref}>
        {init ? <ChatList /> : <SkeletonList />}
        <ChatScrollAnchor />
        <BackBottom target={ref} text={t('backToBottom')} />
      </div>

      {chatInput}
    </Flexbox>
  );
});

export default Conversation;
