import { ActionIcon, Button } from '@lobehub/ui';
import { message } from 'antd';
import { LogIn, Upload } from 'lucide-react';
import { memo, useState } from 'react';

import { HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useMarketAuth } from '@/layout/AuthProvider/MarketAuth';
import { useServerConfigStore } from '@/store/serverConfig';

import UploadAgentVersionModal from './UploadAgentVersionModal';

const UploadAgentVersionButton = memo<{ modal?: boolean }>(({ modal }) => {
  const mobile = useServerConfigStore((s) => s.isMobile);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, isLoading, signIn } = useMarketAuth();

  console.log('[UploadAgentVersionButton] Market auth status:', { isAuthenticated, isLoading });

  // 处理按钮点击事件
  const handleButtonClick = async () => {
    console.log('[UploadAgentVersionButton] Button clicked, isAuthenticated:', isAuthenticated);

    if (isAuthenticated) {
      // 已授权，打开发布新版本弹窗
      console.log('[UploadAgentVersionButton] User is authenticated, opening upload version modal');
      setIsModalOpen(true);
    } else {
      // 未授权，启动授权流程
      console.log('[UploadAgentVersionButton] User not authenticated, starting authorization');
      try {
        message.loading({ content: '正在启动授权流程...', key: 'market-auth' });
        await signIn();
        message.success({ content: '授权成功！现在可以发布新版本了', key: 'market-auth' });
        // 授权成功后自动打开发布弹窗
        setIsModalOpen(true);
      } catch (error) {
        console.error('[UploadAgentVersionButton] Authorization failed:', error);
        message.error({
          content: `授权失败: ${error instanceof Error ? error.message : '未知错误'}`,
          key: 'market-auth',
        });
      }
    }
  };

  // 获取按钮文案和图标
  const getButtonProps = () => {
    if (isAuthenticated) {
      return {
        icon: Upload,
        text: '发布新版本',
        title: '发布新版本到助手市场',
      };
    } else {
      return {
        icon: LogIn,
        text: '发布新版本(未登录)',
        title: '发布新版本到助手市场',
      };
    }
  };

  const buttonProps = getButtonProps();

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

      {/* 只有在已授权时才显示发布新版本弹窗 */}
      {isAuthenticated && (
        <UploadAgentVersionModal
          onCancel={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
          open={isModalOpen}
        />
      )}
    </>
  );
});

export default UploadAgentVersionButton;
