import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Loader from '@/components/CircleLoader';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
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
  ({ messageId, index, apiName, toolCallId, icon, title }) => {
    const { styles } = useStyles();

    const isLoading = useChatStore((s) => {
      const toolMessageId = chatSelectors.getMessageByToolCallId(toolCallId)(s)?.id;
      const isToolCallStreaming = chatSelectors.isToolCallStreaming(messageId, index)(s);
      const isPluginApiInvoking = !toolMessageId
        ? true
        : chatSelectors.isPluginApiInvoking(toolMessageId)(s);
      return isToolCallStreaming || isPluginApiInvoking;
    });

    return (
      <Flexbox align={'center'} className={isLoading ? styles.shinyText : ''} gap={4} horizontal>
        {isLoading ? <Loader /> : icon}
        <Flexbox align={'baseline'} gap={4} horizontal>
          <div>{title}</div>/<span className={styles.apiName}>{apiName}</span>
        </Flexbox>
      </Flexbox>
    );
  },
);

export default BuiltinPluginTitle;
