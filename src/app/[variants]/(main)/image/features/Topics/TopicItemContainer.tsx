'use client';

import { Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { type ReactNode } from 'react';
import { Center, CenterProps } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  activeContainer: css`
    background: ${token.colorPrimaryBg};
    border: 2px solid ${token.colorPrimary};

    &:hover {
      background: ${token.colorPrimaryBgHover};
    }
  `,
  container: css`
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    border-radius: 6px;
    position: relative;
    background: transparent;
    width: 50px;
    height: 50px;
    flex: none;

    &:hover {
      transform: scale(1.05);
      background: ${token.colorFillSecondary};
    }

    &:active {
      transform: scale(0.98);
      background: ${token.colorFillTertiary};
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at center, ${token.colorPrimary}20 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      border-radius: 6px;
    }

    &:active::before {
      opacity: 1;
    }
  `,
}));

interface TopicItemContainerProps extends CenterProps {
  active?: boolean;
  children: ReactNode;
  tooltip?: ReactNode;
}

const TopicItemContainer = ({
  children,
  className,
  active,
  tooltip,
  ...rest
}: TopicItemContainerProps) => {
  const { styles, cx } = useStyles();

  const content = (
    <Center className={cx(styles.container, active && styles.activeContainer, className)} {...rest}>
      {children}
    </Center>
  );

  if (!tooltip) return content;

  return (
    <Tooltip arrow placement="left" title={tooltip}>
      {content}
    </Tooltip>
  );
};

export default TopicItemContainer;
