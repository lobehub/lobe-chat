import { AiProviderSourceType } from '@lobechat/types';
import { ProviderIcon } from '@lobehub/icons-rn';
import { ActionIcon, Cell } from '@lobehub/ui-rn';
import { Image } from 'expo-image';
import { BoltIcon } from 'lucide-react-native';
import { memo } from 'react';

import { useTheme } from '@/components/styles';

interface ProviderItemRenderProps {
  logo?: string;
  name: string;
  onPressSetting?: () => void;
  provider: string;
  source?: AiProviderSourceType;
}

/**
 * 提供商项渲染组件
 * 显示提供商图标和名称，对齐Web端实现
 */
const ProviderItemRender = memo<ProviderItemRenderProps>(
  ({ onPressSetting, provider, name, source, logo }) => {
    const token = useTheme();

    return (
      <Cell
        extra={
          <ActionIcon
            color={token.colorTextSecondary}
            icon={BoltIcon}
            onPress={onPressSetting}
            pressEffect
            size={20}
          />
        }
        icon={
          source === 'custom' && logo ? (
            <Image
              cachePolicy="memory-disk"
              contentFit="contain"
              source={{ uri: logo }}
              style={{
                borderRadius: 10,
                height: 20,
                width: 20,
              }}
              transition={150}
            />
          ) : (
            <ProviderIcon
              color={token.colorTextSecondary}
              provider={provider}
              size={20}
              type={'mono'}
            />
          )
        }
        iconSize={20}
        showArrow={false}
        title={name}
        titleProps={{
          fontSize: 15,
          type: 'secondary',
          weight: '500',
        }}
      />
    );
  },
);

ProviderItemRender.displayName = 'ProviderItemRender';

export default ProviderItemRender;
