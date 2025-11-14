import { ActionIcon, Button } from '@lobehub/ui';
import { message } from 'antd';
import { LogIn, Share2, Upload } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { checkOwnership } from '@/hooks/useAgentOwnershipCheck';
import { useMarketAuth } from '@/layout/AuthProvider/MarketAuth';
import { resolveMarketAuthError } from '@/layout/AuthProvider/MarketAuth/errors';
import { useServerConfigStore } from '@/store/serverConfig';

import MarketPublishModal, { type MarketPublishAction } from './MarketPublishModal';

interface MarketPublishButtonProps {
  action: MarketPublishAction;
  marketIdentifier?: string;
  modal?: boolean;
}

const MarketPublishButton = memo<MarketPublishButtonProps>(
  ({ action, marketIdentifier, modal }) => {
    const { t: tSetting } = useTranslation('setting');
    const { t: tMarketAuth } = useTranslation('marketAuth');
    const mobile = useServerConfigStore((s) => s.isMobile);
    const [openState, setOpenState] = useState<{ submit: boolean; upload: boolean }>({
      submit: false,
      upload: false,
    });
    const { isAuthenticated, isLoading, session, signIn } = useMarketAuth();

    const buttonCopy = useMemo(() => {
      if (action === 'upload') {
        return {
          authenticated: {
            icon: Upload,
            text: tSetting('marketPublish.upload.button'),
            title: tSetting('marketPublish.upload.tooltip'),
          },
          successMessage: tMarketAuth('messages.success.upload'),
          unauthenticated: {
            icon: LogIn,
            text: tSetting('marketPublish.upload.button'),
            title: tSetting('marketPublish.upload.tooltip'),
          },
        } as const;
      }

      const submitText = tSetting('submitAgentModal.tooltips');

      return {
        authenticated: {
          icon: Share2,
          text: submitText,
          title: submitText,
        },
        successMessage: tMarketAuth('messages.success.submit'),
        unauthenticated: {
          icon: LogIn,
          text: tSetting('marketPublish.submit.button'),
          title: tSetting('marketPublish.submit.tooltip'),
        },
      } as const;
    }, [action, tMarketAuth, tSetting]);

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

      console.log(
        `[MarketPublishButton][${action}] User not authenticated, starting authorization`,
      );
      try {
        message.loading({ content: tMarketAuth('messages.loading'), key: 'market-auth' });
        const accountId = await signIn();
        message.success({ content: buttonCopy.successMessage, key: 'market-auth' });

        let targetAction: MarketPublishAction = action;

        if (marketIdentifier && accountId !== null) {
          let accessToken = session?.accessToken;

          if (!accessToken && typeof window !== 'undefined') {
            const storedSession = sessionStorage.getItem('market_auth_session');
            if (storedSession) {
              try {
                const parsed = JSON.parse(storedSession) as { accessToken?: string };
                accessToken = parsed.accessToken;
              } catch (parseError) {
                console.error('[MarketPublishButton] Failed to parse stored session:', parseError);
              }
            }
          }

          if (accessToken) {
            try {
              const isOwner = await checkOwnership({
                accessToken,
                accountId,
                marketIdentifier,
                skipCache: true,
              });

              targetAction = isOwner ? 'upload' : 'submit';
            } catch (ownershipError) {
              console.error('[MarketPublishButton] Failed to confirm ownership:', ownershipError);
            }
          }
        }

        openModal(targetAction);
      } catch (error) {
        console.error(`[MarketPublishButton][${action}] Authorization failed:`, error);
        const normalizedError = resolveMarketAuthError(error);
        message.error({
          content: tMarketAuth(`errors.${normalizedError.code}`),
          key: 'market-auth',
        });
      }
    }, [
      action,
      buttonCopy.successMessage,
      isAuthenticated,
      marketIdentifier,
      openModal,
      session?.accessToken,
      signIn,
      tMarketAuth,
    ]);

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
  },
);

MarketPublishButton.displayName = 'MarketPublishButton';

export default MarketPublishButton;
