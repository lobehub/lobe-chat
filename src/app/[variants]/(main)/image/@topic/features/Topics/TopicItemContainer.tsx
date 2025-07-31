'use client';

import { Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { type ReactNode } from 'react';
import { Center, CenterProps } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  activeContainer: css`
    border: 2px solid ${token.colorPrimary};
    background: ${token.colorPrimaryBg};

    &:hover {
      background: ${token.colorPrimaryBgHover};
    }
  `,
  container: css`
    cursor: pointer;

    position: relative;

    flex: none;

    width: 50px;
    height: 50px;
    border-radius: 6px;

    background: transparent;

    transition: all 0.2s ease-in-out;

    &::before {
      pointer-events: none;
      content: '';

      position: absolute;
      inset: 0;

      border-radius: 6px;

      opacity: 0;
      background: radial-gradient(circle at center, ${token.colorPrimary}20 0%, transparent 70%);

      transition: opacity 0.3s ease;
    }

    &:hover {
      background: ${token.colorFillSecondary};
    }

    &:active {
      background: ${token.colorFillTertiary};
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
