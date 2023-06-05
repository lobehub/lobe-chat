import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import FolderPanel from '@/features/FolderPanel';
import { ChatList } from './ChatList';
import Header from './Header';

export const useStyles = createStyles(({ css }) => ({
  center: css`
    overflow-x: hidden;
    overflow-y: scroll;
    padding-inline: 4px 0;
  `,
}));

export const Sessions = memo(() => {
  const { styles, cx } = useStyles();

  return (
    <FolderPanel>
      <Flexbox gap={8} height={'100%'}>
        <Header />

        <Flexbox className={cx(styles.center)}>
          <ChatList />
        </Flexbox>
      </Flexbox>
    </FolderPanel>
  );
});
