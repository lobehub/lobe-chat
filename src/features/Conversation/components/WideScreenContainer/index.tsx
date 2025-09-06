'use client';

import { createStyles } from 'antd-style';
import { memo, useEffect } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import { CONVERSATION_MIN_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    align-self: center;
    transition: width 0.25s ${token.motionEaseInOut};
  `,
}));

interface WideScreenContainerProps extends FlexboxProps {
  onChange?: () => void;
}

const WideScreenContainer = memo<WideScreenContainerProps>(
  ({ children, className, onChange, ...rest }) => {
    const { cx, styles } = useStyles();
    const wideScreen = useGlobalStore(systemStatusSelectors.wideScreen);

    useEffect(() => {
      onChange?.();
    }, [wideScreen]);

    return (
      <Flexbox
        className={cx(styles.container, className)}
        width={wideScreen ? '100%' : `min(${CONVERSATION_MIN_WIDTH}px, 100%)`}
        {...rest}
      >
        {children}
      </Flexbox>
    );
  },
);

export default WideScreenContainer;
