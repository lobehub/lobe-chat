'use client';

import { createStyles } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import BackButton, { BACK_BUTTON_ID } from '@/features/NavPanel/BackButton';
import TogglePanelButton from '@/features/NavPanel/TogglePanelButton';

import AgentInfo from './AgentInfo';

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

const HeaderInfo = memo<PropsWithChildren>(() => {
  const { styles } = useStyles();

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
        <AgentInfo />
      </Flexbox>
      <TogglePanelButton />
    </Flexbox>
  );
});

export default HeaderInfo;
