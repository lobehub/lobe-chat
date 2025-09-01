import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AiProviderListItem } from '@/types/aiProvider';
import { useThemeToken } from '@/theme';
import { useAiInfraStore } from '@/store/aiInfra';
import { InstantSwitch } from '@/components';

import { useStyles } from './style';
import { ProviderCombine } from '@lobehub/icons-rn';
import { useTranslation } from 'react-i18next';

interface ProviderCardProps {
  provider: AiProviderListItem;
}

const ProviderCard = memo<ProviderCardProps>(({ provider }) => {
  const { t } = useTranslation('providers');
  const { styles } = useStyles();
  const router = useRouter();
  const token = useThemeToken();
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
            <InstantSwitch
              enabled={enabled}
              onChange={handleSwitchChange}
              size="small"
              thumbColor={token.colorBgContainer}
              trackColor={{
                false: '#e9e9eb', // iOS风格关闭状态
                true: '#34c759', // iOS风格开启状态
              }}
            />
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
