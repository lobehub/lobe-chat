import { Avatar, Block, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

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
          <Text as={'h2'} className={title} ellipsis>
            {title}
          </Text>
          <Text
            as={'p'}
            className={styles.desc}
            ellipsis={{
              rows: 2,
            }}
          >
            {description}
          </Text>
        </Flexbox>
      </Block>
    );
  },
);

export default KnowledgeItem;
