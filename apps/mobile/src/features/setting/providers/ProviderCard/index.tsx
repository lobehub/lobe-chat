import { AiProviderListItem } from '@lobechat/types';
import { ProviderCombine } from '@lobehub/icons-rn';
import { InstantSwitch } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/components/styles';
import { useAiInfraStore } from '@/store/aiInfra';

import { useStyles } from './style';

interface ProviderCardProps {
  provider: AiProviderListItem;
}

const ProviderCard = memo<ProviderCardProps>(({ provider }) => {
  const { t } = useTranslation('providers');
  const { styles } = useStyles();
  const router = useRouter();
  const token = useTheme();
  const { description, id, enabled, source } = provider;

  // 获取store中的方法
  const { toggleProviderEnabled } = useAiInfraStore();

  const handlePress = () => {
    router.push(`/setting/providers/${id}`);
  };

  const handleSwitchChange = async (value: boolean) => {
    try {
      // 执行切换操作
      await toggleProviderEnabled(id, value);
      console.log(`Successfully toggled provider ${id} to ${value ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error(`Failed to toggle provider ${id}:`, error);
      // TODO: 可以考虑添加toast提示用户操作失败
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* 顶部：Logo + 名称（可点击跳转） */}
        <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
          <View style={styles.header}>
            <ProviderCombine
              color={token.colorText}
              iconProps={{
                color: token.colorText,
              }}
              provider={id}
              size={24}
              type={'color'}
            />
            <InstantSwitch enabled={enabled} onChange={handleSwitchChange} size="small" />
          </View>
        </TouchableOpacity>

        {/* 中部：描述文字（可点击跳转） */}
        <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
          <Text numberOfLines={2} style={styles.description}>
            {source === 'custom' ? description : t(`${id}.description`)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default ProviderCard;
