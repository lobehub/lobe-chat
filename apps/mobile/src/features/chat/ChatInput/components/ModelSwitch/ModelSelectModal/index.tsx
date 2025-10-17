import { EnabledProviderWithModels } from '@lobechat/types';
import { BottomSheet, Center, Flexbox, Icon, Text, useTheme } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAiInfraInit } from '@/hooks/useAiInfraInit';
import { useCurrentAgent } from '@/hooks/useCurrentAgent';
import { useEnabledChatModels } from '@/hooks/useEnabledChatModels';

import ModelItemRender from '../ModelItemRender';
import ProviderItemRender from '../ProviderItemRender';

// 生成菜单键，与Web端保持一致
const menuKey = (provider: string, model: string) => `${provider}-${model}`;

interface ModelSelectModalProps {
  onClose: () => void;
  visible: boolean;
}

/**
 * 模型选择模态框
 * 完全对齐Web端ModelSwitchPanel的逻辑和显示
 */
const ModelSelectModal = memo<ModelSelectModalProps>(({ visible, onClose }) => {
  const { currentModel, currentProvider, updateAgentConfig } = useCurrentAgent();
  const { t } = useTranslation();
  const enabledModels = useEnabledChatModels();
  const { isLoading: infraLoading, hasError: infraError } = useAiInfraInit();
  const token = useTheme();
  const router = useRouter();

  // 当前选中的menuKey
  const activeKey = useMemo(() => {
    return menuKey(currentProvider, currentModel);
  }, [currentProvider, currentModel]);

  // 处理模型选择
  const handleModelSelect = useCallback(
    async (model: string, provider: string) => {
      try {
        onClose();
        await updateAgentConfig({
          model,
          provider,
        });
      } catch (error) {
        console.error('Failed to update model:', error);
      }
    },
    [updateAgentConfig, onClose],
  );

  // 获取模型项列表（对齐Web端getModelItems逻辑）
  const getModelItems = useCallback(
    (provider: EnabledProviderWithModels) => {
      // 如果没有模型，返回空状态提示
      if (provider.children.length === 0) {
        return [
          <Center
            gap={6}
            horizontal
            key={`${provider.id}-empty`}
            onPress={() => {
              onClose();
              router.push(`/setting/providers/${provider.id}`);
            }}
            padding={16}
          >
            <Text type={'secondary'}>
              {t('ModelSwitchPanel.emptyModel', {
                ns: 'components',
              })}
            </Text>
            <Icon color={token.colorTextTertiary} icon={ArrowRight} size={16} />
          </Center>,
        ];
      }

      // 返回模型列表
      return provider.children.map((model) => {
        const isSelected = activeKey === menuKey(provider.id, model.id);

        return (
          <ModelItemRender
            active={isSelected}
            key={menuKey(provider.id, model.id)}
            onPress={() => handleModelSelect(model.id, provider.id)}
            {...model}
            showInfoTag={true}
            type="chat"
          />
        );
      });
    },
    [activeKey, handleModelSelect, token.colorTextTertiary, token.marginXS, onClose, router, t],
  );

  // 渲染提供商分组（对齐Web端逻辑）
  const renderProviderGroup = useCallback(
    (provider: EnabledProviderWithModels) => {
      return (
        <Flexbox key={provider.id}>
          {/* 提供商标题 */}
          <ProviderItemRender
            logo={provider.logo}
            name={provider.name}
            onPressSetting={() => {
              onClose();
              router.push(`/setting/providers/${provider.id}`);
            }}
            provider={provider.id}
            source={provider.source}
          />
          {/* 模型列表 */}
          {getModelItems(provider)}
        </Flexbox>
      );
    },
    [getModelItems, token.colorText, onClose, router],
  );

  // 计算要显示的内容（对齐Web端逻辑）
  const renderContent = useMemo(() => {
    // 加载中状态
    if (infraLoading) {
      return (
        <Center padding={16}>
          <Text type={'secondary'}>{t('status.loading', { ns: 'common' })}</Text>
        </Center>
      );
    }

    // 错误状态
    if (infraError) {
      return (
        <Center gap={6} padding={16}>
          <Text fontSize={16} weight={500}>
            {t('status.error', { ns: 'common' })}
          </Text>
          <Text type={'secondary'}>
            {t('status.networkRetryTip', {
              ns: 'common',
            })}
          </Text>
        </Center>
      );
    }

    // 空提供商状态（对齐Web端emptyProvider逻辑）
    if (enabledModels.length === 0) {
      return (
        <Center
          gap={6}
          horizontal
          onPress={() => {
            router.push('/setting/providers');
            onClose();
            console.log('Navigate to provider settings');
          }}
          padding={16}
        >
          <Text type={'secondary'}>
            {t('ModelSwitchPanel.emptyProvider', {
              ns: 'components',
            })}
          </Text>
          <Icon color={token.colorTextTertiary} icon={ArrowRight} size={16} />
        </Center>
      );
    }

    // 正常显示提供商分组
    return enabledModels.map(renderProviderGroup);
  }, [
    infraLoading,
    infraError,
    enabledModels,
    renderProviderGroup,
    token.colorTextTertiary,
    token.marginXS,
    t,
    router,
    onClose,
  ]);

  return (
    <BottomSheet
      onClose={onClose}
      open={visible}
      snapPoints={['70%', '90%']}
      title={t('ModelSwitchPanel.chooseModel', {
        ns: 'components',
      })}
    >
      {renderContent}
    </BottomSheet>
  );
});

ModelSelectModal.displayName = 'ModelSelectModal';

export default ModelSelectModal;
