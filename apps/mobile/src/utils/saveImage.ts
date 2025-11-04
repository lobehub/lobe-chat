import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';

/**
 * 保存图片到相册
 * @param imageUrl 图片 URL
 * @returns Promise<boolean> 是否保存成功
 */
export async function saveImageToLibrary(imageUrl: string): Promise<boolean> {
  try {
    // 1. 请求权限
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      return false;
    }

    // 2. 直接保存网络图片到相册
    // MediaLibrary.saveToLibraryAsync 支持直接保存网络 URL
    await MediaLibrary.saveToLibraryAsync(imageUrl);

    return true;
  } catch (error) {
    console.error('Save image failed:', error);
    return false;
  }
}

/**
 * 保存图片并显示提示
 * @param imageUrl 图片 URL
 * @param t i18n 翻译函数
 */
export async function saveImageWithToast(
  imageUrl: string,
  t: (key: string) => string,
): Promise<void> {
  try {
    // 请求权限
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status === 'denied') {
      Alert.alert(t('common.image.permissionDenied'), t('common.image.permissionRequest'), [
        { style: 'cancel', text: t('common.actions.cancel') },
        {
          onPress: () => {
            if (Platform.OS === 'ios') {
              // iOS 跳转到设置
              // Linking.openURL('app-settings:');
            }
          },
          text: t('common.actions.continue'),
        },
      ]);
      return;
    }

    if (status !== 'granted') {
      return;
    }

    // 保存图片
    const success = await saveImageToLibrary(imageUrl);

    if (success) {
      Alert.alert(t('status.success'), t('image.saveSuccess'));
    } else {
      Alert.alert(t('status.error'), t('image.saveFailed'));
    }
  } catch (error) {
    console.error('Save image with toast failed:', error);
    Alert.alert(t('status.error'), t('image.saveFailed'));
  }
}
