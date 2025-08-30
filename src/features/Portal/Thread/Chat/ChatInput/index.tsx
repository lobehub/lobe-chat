'use client';

import { Alert } from '@lobehub/ui';
import Link from 'next/link';
import { memo } from 'react';
import { Trans } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import DesktopChatInput from '@/features/ChatInput/Desktop';
import { ChatInputProvider } from '@/features/ChatInput/hooks/useChatInput';
import WideScreenContainer from '@/features/Conversation/components/WideScreenContainer';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

const Desktop = memo(() => {
  const [hideThreadLimitAlert, updateSystemStatus] = useGlobalStore((s) => [
    systemStatusSelectors.systemStatus(s).hideThreadLimitAlert,
    s.updateSystemStatus,
  ]);

  // TODO: 修复一下话题的发送

  return (
    <WideScreenContainer>
      {!hideThreadLimitAlert && (
        <Flexbox paddingBlock={'0 6px'} paddingInline={12}>
          <Alert
            closable
            message={
              <Trans i18nKey={'notSupportMultiModals'} ns={'thread'}>
                子话题暂不支持文件/图片上传，如有需求，欢迎留言：
                <Link
                  href={'https://github.com/lobehub/lobe-chat/discussions/4717'}
                  style={{ textDecoration: 'underline' }}
                >
                  💬 讨论
                </Link>
              </Trans>
            }
            onClose={() => {
              updateSystemStatus({ hideThreadLimitAlert: true });
            }}
            type={'info'}
          />
        </Flexbox>
      )}

      <ChatInputProvider
        config={{
          actions: ['typo', 'stt', 'portalToken'],
        }}
      >
        <DesktopChatInput />
      </ChatInputProvider>
    </WideScreenContainer>
  );
});

export default Desktop;
