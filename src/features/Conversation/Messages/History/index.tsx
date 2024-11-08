import { ModelTag } from '@lobehub/icons';
import { Icon, Markdown } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ScrollText } from 'lucide-react';
import { Center, Flexbox } from 'react-layout-kit';

import { ChatMessage } from '@/types/message';

import HistoryDivider from '../../components/HistoryDivider';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    //background-color: ${token.colorBgContainer};
    padding: 12px;
    border-radius: 12px;
  `,
  content: css`
    color: ${token.colorTextDescription};
  `,
  line: css`
    width: 3px;
    height: 100%;
    background: ${token.colorBorder};
  `,
}));

const History = ({ content, extra }: ChatMessage) => {
  const { styles, theme } = useStyles();
  return (
    <Flexbox paddingInline={24} style={{ paddingBottom: 8 }}>
      <HistoryDivider enable />

      <Flexbox className={styles.container} gap={8}>
        <Flexbox align={'flex-start'} gap={8} horizontal>
          <Center height={20} width={20}>
            <Icon
              icon={ScrollText}
              size={{ fontSize: 16 }}
              style={{ color: theme.colorTextDescription }}
            />
          </Center>
          <Typography.Text type={'secondary'}>历史消息总结</Typography.Text>

          {extra?.fromModel && (
            <div>
              <ModelTag model={extra?.fromModel} />
            </div>
          )}
        </Flexbox>
        <Flexbox align={'flex-start'} gap={8} horizontal>
          <Flexbox align={'center'} padding={8} width={20}>
            <div className={styles.line}></div>
          </Flexbox>
          <Markdown className={styles.content} variant={'chat'}>
            {content}
          </Markdown>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};

export default History;
