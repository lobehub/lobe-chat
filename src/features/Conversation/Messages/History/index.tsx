import { Icon, Markdown } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ScrollText } from 'lucide-react';
import { Center, Flexbox } from 'react-layout-kit';

import { ChatMessage } from '@/types/message';

import HistoryDivider from '../../components/HistoryDivider';

const useStyles = createStyles(({ css, token }) => ({
  md: css`
    background-color: ${token.colorBgContainer};
    padding: 12px;
    border-radius: 12px;
  `,
}));

const History = ({ content }: ChatMessage) => {
  const { styles } = useStyles();
  return (
    <Flexbox paddingInline={24} style={{ paddingBottom: 8 }}>
      <HistoryDivider enable />

      <Flexbox align={'flex-start'} className={styles.md} gap={8} horizontal>
        <Center height={24} width={24}>
          <Icon icon={ScrollText} size={{ fontSize: 20 }}></Icon>
        </Center>
        <Flexbox gap={4}>
          <Flexbox style={{ fontSize: 16 }}>历史消息总结</Flexbox>
          <Markdown variant={'chat'}>{content}</Markdown>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};

export default History;
