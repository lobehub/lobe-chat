'use client';

import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { CSSProperties, memo, useEffect } from 'react';
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
  minWidth?: number;
  onChange?: () => void;
  wrapperStyle?: CSSProperties;
}

const WideScreenContainer = memo<WideScreenContainerProps>(
  ({ children, className, onChange, wrapperStyle, onClick, minWidth, ...rest }) => {
    const { cx, styles } = useStyles();
    const wideScreen = useGlobalStore(systemStatusSelectors.wideScreen);

    useEffect(() => {
      onChange?.();
    }, [wideScreen]);

    return (
      <Flexbox onClick={onClick} style={wrapperStyle} width={'100%'}>
        <Flexbox
          className={cx(styles.container, className)}
          paddingInline={16}
          width={wideScreen ? '100%' : `min(${minWidth || CONVERSATION_MIN_WIDTH}px, 100%)`}
          {...rest}
        >
          {children}
        </Flexbox>
      </Flexbox>
    );
  },
  isEqual,
);

export default WideScreenContainer;
