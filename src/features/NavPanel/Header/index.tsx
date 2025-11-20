'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AddButton from './components/AddButton';
import Nav from './components/Nav';
import TogglePanelButton from './components/TogglePanelButton';
import User from './components/User';

const useStyles = createStyles(({ css, token }) => ({
  base: css`
    overflow: hidden;
    transition:
      width,
      opacity 200ms ${token.motionEaseInOut};
  `,
  hide: css`
    pointer-events: none;
    width: 0;
    opacity: 0;
  `,
}));

const Header = memo<{ expand?: boolean }>(({ expand }) => {
  const { cx, styles } = useStyles();
  return (
    <Flexbox gap={8} paddingBlock={8} paddingInline={8}>
      <Flexbox align={'center'} horizontal justify={'space-between'}>
        <User expand={expand} />
        <Flexbox
          align={'center'}
          className={cx(styles.base, !expand && styles.hide)}
          gap={2}
          horizontal
        >
          <TogglePanelButton />
          <AddButton />
        </Flexbox>
      </Flexbox>
      <Nav />
    </Flexbox>
  );
});

export default Header;
