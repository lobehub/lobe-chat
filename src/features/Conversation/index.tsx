import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';

import SkeletonList from './components/SkeletonList';
import ChatList from './components/VirtualizedList';
import { useInitConversation } from './hooks/useInitConversation';

const useStyles = createStyles(({ css, responsive, stylish, cx }, fontSize: number = 14) =>
  cx(
    css`
      position: relative;
      overflow-y: auto;
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
  mobile?: boolean;
}

const Conversation = memo<ConversationProps>(({ chatInput, mobile }) => {
  const fontSize = useGlobalStore((s) => settingsSelectors.currentSettings(s).fontSize);
  const { styles } = useStyles(fontSize);

  const init = useInitConversation();

  return (
    //  relative is required, ChatInput's absolute position needs it
    <Flexbox flex={1} style={{ position: 'relative' }}>
      <div className={styles}>
        {init ? <ChatList mobile={mobile} /> : <SkeletonList mobile={mobile} />}
      </div>
      {chatInput}
    </Flexbox>
  );
});

export default Conversation;
