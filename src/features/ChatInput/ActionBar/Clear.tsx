import { ActionIcon } from '@lobehub/ui';
import { Popconfirm } from 'antd';
import { Eraser } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useChatStore } from '@/store/chat';
import { useFileStore } from '@/store/file';

const Clear = memo(() => {
  const { t } = useTranslation('setting');
  const [clearMessage] = useChatStore((s) => [s.clearMessage]);
  const [clearImageList] = useFileStore((s) => [s.clearChatUploadFileList]);
  const [confirmOpened, updateConfirmOpened] = useState(false);
  const mobile = useIsMobile();

  const resetConversation = useCallback(async () => {
    await clearMessage();
    clearImageList();
  }, []);

  const actionTitle: any = confirmOpened ? void 0 : t('clearCurrentMessages', { ns: 'chat' });

  const popconfirmPlacement = mobile ? 'top' : 'topRight';

  return (
    <Popconfirm
      arrow={false}
      okButtonProps={{ danger: true, type: 'primary' }}
      onConfirm={resetConversation}
      onOpenChange={updateConfirmOpened}
      open={confirmOpened}
      placement={popconfirmPlacement}
      title={
        <div style={{ marginBottom: '8px', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
          {t('confirmClearCurrentMessages', { ns: 'chat' })}
        </div>
      }
    >
      <ActionIcon
        icon={Eraser}
        overlayStyle={{ maxWidth: 'none' }}
        placement={'bottom'}
        title={actionTitle}
      />
    </Popconfirm>
  );
});

export default Clear;
