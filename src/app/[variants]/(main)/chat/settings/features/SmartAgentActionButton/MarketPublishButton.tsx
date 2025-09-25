import { ActionIcon, Button } from '@lobehub/ui';
import { message } from 'antd';
import { LogIn, Share2, Upload } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useMarketAuth } from '@/layout/AuthProvider/MarketAuth';
import { useServerConfigStore } from '@/store/serverConfig';

import MarketPublishModal, { type MarketPublishAction } from './MarketPublishModal';

interface MarketPublishButtonProps {
  action: MarketPublishAction;
  modal?: boolean;
}

const MarketPublishButton = memo<MarketPublishButtonProps>(({ action, modal }) => {
  const { t } = useTranslation('setting');
  const mobile = useServerConfigStore((s) => s.isMobile);
  const [openState, setOpenState] = useState<{ submit: boolean; upload: boolean }>({
    submit: false,
    upload: false,
  });
  const { isAuthenticated, isLoading, signIn } = useMarketAuth();

  const buttonCopy = useMemo(() => {
    if (action === 'upload') {
      return {
        authenticated: {
          icon: Upload,
          text: '发布新版本',
          title: '发布新版本到助手市场',
        },
        successMessage: '授权成功！现在可以发布新版本了',
        unauthenticated: {
          icon: LogIn,
          text: '发布新版本',
          title: '发布新版本到助手市场',
        },
      } as const;
    }

    const submitText = t('submitAgentModal.tooltips');

    return {
      authenticated: {
        icon: Share2,
        text: submitText,
        title: submitText,
      },
      successMessage: '授权成功！现在可以发布助手了',
      unauthenticated: {
        icon: LogIn,
        text: '分享助手到市场',
        title: '分享助手到市场',
      },
    } as const;
  }, [action, t]);

  const openModal = useCallback((target: MarketPublishAction) => {
    setOpenState((prev) => ({ ...prev, [target]: true }));
  }, []);

  const closeModal = useCallback((target: MarketPublishAction) => {
    setOpenState((prev) => ({ ...prev, [target]: false }));
  }, []);

  const handleButtonClick = useCallback(async () => {
    console.log(
      `[MarketPublishButton][${action}] Button clicked, isAuthenticated:`,
      isAuthenticated,
    );

    if (isAuthenticated) {
      console.log(`[MarketPublishButton][${action}] User is authenticated, opening modal`);
      openModal(action);
      return;
    }

    console.log(`[MarketPublishButton][${action}] User not authenticated, starting authorization`);
    try {
      message.loading({ content: '正在启动授权流程...', key: 'market-auth' });
      await signIn();
      message.success({ content: buttonCopy.successMessage, key: 'market-auth' });
      openModal(action);
    } catch (error) {
      console.error(`[MarketPublishButton][${action}] Authorization failed:`, error);
      message.error({
        content: `授权失败: ${error instanceof Error ? error.message : '未知错误'}`,
        key: 'market-auth',
      });
    }
  }, [action, buttonCopy.successMessage, isAuthenticated, openModal, signIn]);

  const buttonProps = isAuthenticated ? buttonCopy.authenticated : buttonCopy.unauthenticated;

  return (
    <>
      {modal ? (
        <Button
          block
          disabled={isLoading}
          icon={buttonProps.icon}
          loading={isLoading}
          onClick={handleButtonClick}
          variant={'filled'}
        >
          {buttonProps.text}
        </Button>
      ) : (
        <ActionIcon
          icon={buttonProps.icon}
          loading={isLoading}
          onClick={handleButtonClick}
          size={HEADER_ICON_SIZE(mobile)}
          title={buttonProps.title}
        />
      )}

      {isAuthenticated && (
        <>
          <MarketPublishModal
            action="submit"
            onCancel={() => closeModal('submit')}
            onSuccess={() => closeModal('submit')}
            open={openState.submit}
          />

          <MarketPublishModal
            action="upload"
            onCancel={() => closeModal('upload')}
            onSuccess={() => closeModal('upload')}
            open={openState.upload}
          />
        </>
      )}
    </>
  );
});

MarketPublishButton.displayName = 'MarketPublishButton';

export default MarketPublishButton;
