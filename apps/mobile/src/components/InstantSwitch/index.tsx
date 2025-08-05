import React, { memo, useState, useEffect } from 'react';
import { Switch, ActivityIndicator, ViewStyle, View } from 'react-native';

import { useStyles } from './style';

export interface InstantSwitchProps {
  // 基础属性
  disabled?: boolean;
  enabled: boolean;
  loadingColor?: string;
  onChange: (enabled: boolean) => Promise<void>;
  size?: 'small' | 'default' | 'large';
  style?: ViewStyle;
  thumbColor?: string;
  trackColor?: {
    false: string;
    true: string;
  };
  trackStyle?: ViewStyle;
}

const InstantSwitch = memo<InstantSwitchProps>(
  ({
    disabled = false,
    enabled,
    loadingColor,
    onChange,
    size = 'default',
    style,
    thumbColor,
    trackColor,
    trackStyle,
  }) => {
    const { styles } = useStyles({ disabled, size });

    // 本地状态管理
    const [localEnabled, setLocalEnabled] = useState(enabled);
    const [isToggling, setIsToggling] = useState(false);

    // 同步本地状态与props
    useEffect(() => {
      setLocalEnabled(enabled);
    }, [enabled]);

    const handleSwitchChange = async (value: boolean) => {
      if (isToggling || disabled) {
        return; // 防止重复操作或禁用状态
      }

      // 保存当前状态，用于错误回滚
      const previousState = localEnabled;

      // 乐观更新：立即更新本地状态
      setLocalEnabled(value);
      setIsToggling(true);

      try {
        // 执行异步切换操作
        await onChange(value);

        // 确保loading indicator至少显示300ms，让用户能看到
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 300);
        });
      } catch {
        // 先结束loading状态，让Switch重新显示
        setIsToggling(false);

        // 然后进行状态回滚，让用户看到视觉变化
        setTimeout(() => {
          setLocalEnabled(previousState);
        }, 50); // 短暂延迟，确保Switch先显示出来

        // TODO: 可以考虑添加toast提示用户操作失败
        return; // 提前返回，避免执行finally
      }

      setIsToggling(false);
    };

    // 计算Switch组件的颜色
    const getTrackColor = () => {
      if (trackColor) return trackColor;

      return {
        false: '#e9e9eb', // iOS风格关闭状态
        true: '#34c759', // iOS风格开启状态
      };
    };

    const getThumbColor = () => {
      if (thumbColor) return thumbColor;
      return '#ffffff'; // 默认白色滑块
    };

    const getLoadingColor = () => {
      if (loadingColor) return loadingColor;
      return '#007AFF'; // 默认蓝色loading
    };

    return (
      <View style={[styles.container, style]}>
        {isToggling ? (
          // Loading状态：只显示loading指示器
          <ActivityIndicator
            color={getLoadingColor()}
            size={size === 'small' ? 12 : size === 'large' ? 20 : 16}
            style={styles.loading}
          />
        ) : (
          // 正常状态：显示Switch
          <Switch
            disabled={disabled}
            onValueChange={handleSwitchChange}
            style={[styles.switch, trackStyle]}
            thumbColor={getThumbColor()}
            trackColor={getTrackColor()}
            value={localEnabled}
          />
        )}
      </View>
    );
  },
);

export default InstantSwitch;
