'use client';

import { createStyles } from 'antd-style';
import { CSSProperties, ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import BackButton, { BACK_BUTTON_ID } from '@/features/NavPanel/BackButton';
import User from '@/features/NavPanel/Header/components/User';
import TogglePanelButton from '@/features/NavPanel/TogglePanelButton';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow: hidden;

    #${BACK_BUTTON_ID} {
      width: 0 !important;
      opacity: 0;
      transition: all 0.2s ${token.motionEaseOut};
    }

    &:hover {
      #${BACK_BUTTON_ID} {
        width: 24px !important;
        opacity: 1;
      }
    }
  `,
}));

const SlashIcon = memo<{ color?: string; size?: number; style?: CSSProperties }>(
  ({ style, color, size = '1em' }) => {
    return (
      <svg
        color={color}
        data-testid="geist-icon"
        height={size}
        stroke-linejoin="round"
        style={{
          ...style,
        }}
        viewBox="0 0 16 16"
        width={size}
      >
        <path
          clip-rule="evenodd"
          d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z"
          fill="currentColor"
          fill-rule="evenodd"
        />
      </svg>
    );
  },
);

interface SideBarHeaderLayoutProps {
  left?: ReactNode;
  right?: ReactNode;
}

const SideBarHeaderLayout = memo<SideBarHeaderLayoutProps>(({ left, right }) => {
  const { styles, theme } = useStyles();

  return (
    <Flexbox
      align={'center'}
      className={styles.container}
      flex={'none'}
      gap={8}
      horizontal
      justify={'space-between'}
      padding={2}
    >
      <Flexbox
        align={'center'}
        flex={1}
        gap={2}
        horizontal
        style={{
          overflow: 'hidden',
        }}
      >
        <BackButton
          size={{
            blockSize: 32,
            size: 16,
          }}
        />
        <User lite />
        <SlashIcon color={theme.colorFill} size={16} />
        {left}
      </Flexbox>
      <Flexbox
        align={'center'}
        gap={2}
        horizontal
        justify={'flex-end'}
        style={{
          overflow: 'hidden',
        }}
      >
        <TogglePanelButton />
        {right}
      </Flexbox>
    </Flexbox>
  );
});

export default SideBarHeaderLayout;
