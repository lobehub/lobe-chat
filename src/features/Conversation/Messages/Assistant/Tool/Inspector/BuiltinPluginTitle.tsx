import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { messageStateSelectors } from '@/store/chat/selectors';
import { shinyTextStylish } from '@/styles/loading';

export const useStyles = createStyles(({ css, token }) => ({
  apiName: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    text-overflow: ellipsis;
  `,

  shinyText: shinyTextStylish(token),
}));

interface BuiltinPluginTitleProps {
  apiName: string;
  icon?: ReactNode;
  identifier: string;
  index: number;
  messageId: string;
  title: string;
  toolCallId: string;
}

const BuiltinPluginTitle = memo<BuiltinPluginTitleProps>(
  ({ messageId, index, apiName, title, toolCallId }) => {
    const { styles } = useStyles();

    const isLoading = useChatStore(
      messageStateSelectors.isToolApiNameShining(messageId, index, toolCallId),
    );

    return (
      <Flexbox align={'center'} className={isLoading ? styles.shinyText : ''} gap={4} horizontal>
        <div>{title}</div>
        <Icon icon={ChevronRight} />
        <span className={styles.apiName}>{apiName}</span>
      </Flexbox>
    );
  },
);

export default BuiltinPluginTitle;
