import { Avatar, Block } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const { Title, Paragraph } = Typography;

const useStyles = createStyles(({ css, token }) => {
  return {
    desc: css`
      flex: 1;
      margin: 0 !important;
      font-size: 14px !important;
      color: ${token.colorTextSecondary};
    `,
    title: css`
      margin: 0 !important;
      font-size: 14px !important;
      font-weight: 500 !important;

      &:hover {
        color: ${token.colorLink};
      }
    `,
  };
});

const KnowledgeItem = memo<{ avatar?: string; description?: string; title: string }>(
  ({ avatar, title, description }) => {
    const { styles } = useStyles();

    return (
      <Block gap={12} horizontal padding={12} variant={'outlined'}>
        <Avatar avatar={avatar} size={40} style={{ flex: 'none' }} />
        <Flexbox
          flex={1}
          gap={6}
          style={{
            overflow: 'hidden',
          }}
        >
          <Title
            className={title}
            ellipsis={{
              rows: 1,
            }}
            level={2}
          >
            {title}
          </Title>
          <Paragraph
            className={styles.desc}
            ellipsis={{
              rows: 2,
            }}
          >
            {description}
          </Paragraph>
        </Flexbox>
      </Block>
    );
  },
);

export default KnowledgeItem;
