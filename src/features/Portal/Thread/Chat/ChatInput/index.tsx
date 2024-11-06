'use client';

import { Alert } from '@lobehub/ui';
import Link from 'next/link';
import { memo } from 'react';

import { ActionKeys } from '@/features/ChatInput/ActionBar/config';
import DesktopChatInput from '@/features/ChatInput/Desktop';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import TextArea from './TextArea';

const leftActions = ['stt', 'portalToken'] as ActionKeys[];

const rightActions = [] as ActionKeys[];

const renderTextArea = (onSend: () => void) => <TextArea onSend={onSend} />;

const Desktop = memo(() => {
  const [inputHeight, hideThreadLimitAlert, updateSystemStatus] = useGlobalStore((s) => [
    systemStatusSelectors.threadInputHeight(s),
    systemStatusSelectors.systemStatus(s).hideThreadLimitAlert,
    s.updateSystemStatus,
  ]);

  return (
    <>
      {!hideThreadLimitAlert && (
        <Alert
          banner
          closable
          message={
            <div>
              子话题暂不支持文件/图片上传，如有需求，欢迎留言：
              <Link
                href={'https://github.com/lobehub/lobe-chat/discussions/4717'}
                style={{ textDecoration: 'underline' }}
              >
                💬 讨论
              </Link>
            </div>
          }
          onClose={() => {
            updateSystemStatus({ hideThreadLimitAlert: true });
          }}
          type={'info'}
        />
      )}
      <DesktopChatInput
        footer={{
          saveTopic: false,
          sendMore: false,
        }}
        inputHeight={inputHeight}
        leftActions={leftActions}
        onInputHeightChange={(height) => {
          updateSystemStatus({ threadInputHeight: height });
        }}
        renderTextArea={renderTextArea}
        rightActions={rightActions}
      />
    </>
  );
});

export default Desktop;
