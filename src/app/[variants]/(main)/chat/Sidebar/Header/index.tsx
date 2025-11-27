'use client';

import { Block, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import BackButton, { BACK_BUTTON_ID } from '@/features/NavPanel/BackButton';
import TogglePanelButton from '@/features/NavPanel/TogglePanelButton';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import Avatar from './Avatar';
import SwitchButton from './SwitchButton';

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
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  useInitAgentConfig();

  const [isInbox, title] = useAgentStore((s) => [
    agentSelectors.isInboxAgent(s),
    agentSelectors.currentAgentTitle(s),
  ]);

  const displayTitle = isInbox ? t('inbox.title') : title;

  const openChatSettings = useOpenChatSettings();

  return (
    <Flexbox
      align={'center'}
      className={styles.container}
      flex={'none'}
      gap={8}
      height={48}
      horizontal
      justify={'space-between'}
      padding={8}
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
        <Flexbox
          align={'center'}
          flex={1}
          gap={8}
          horizontal
          style={{
            overflow: 'hidden',
          }}
        >
          <Block
            align={'center'}
            clickable
            height={32}
            justify={'center'}
            onClick={openChatSettings}
            variant={'borderless'}
            width={32}
          >
            <Avatar size={28} />
          </Block>
          <Text ellipsis weight={500}>
            {displayTitle}
          </Text>
          <SwitchButton />
        </Flexbox>
      </Flexbox>
      <TogglePanelButton />
    </Flexbox>
  );
});

export default HeaderInfo;
