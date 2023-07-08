import { sessionSelectors, useChatStore } from '@/store/session';
import { Avatar } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  drawer: css`
    //position: relative;
    // border-left: 1px solid ${token.colorBorder};
  `,
  title: css`
    font-size: ${token.fontSizeHeading4}px;
  `,
  desc: css`
    color: ${token.colorText};
  `,
}));

const ReadMode = memo(() => {
  const { styles, theme } = useStyles();
  const session = useChatStore(sessionSelectors.currentSessionSafe, isEqual);

  return (
    <Center style={{ marginTop: 8 }} gap={12}>
      <Avatar size={100} avatar={session.meta.avatar} />
      <Flexbox className={styles.title}>{session.meta.title}</Flexbox>
      <Flexbox className={styles.desc}>{session.meta.description}</Flexbox>
    </Center>
  );
});

export default ReadMode;
