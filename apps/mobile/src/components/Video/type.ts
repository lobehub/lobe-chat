import type { VideoViewProps } from 'expo-video';
import type { DimensionValue, PressableProps } from 'react-native';

export interface VideoProps
  extends Omit<VideoViewProps, 'player'>,
    Pick<PressableProps, 'onPress' | 'onLongPress'> {
  /**
   * 视频的初始宽高比，在视频加载期间使用此值，加载完成后会自动更新为实际宽高比
   * @default 16 / 9
   */
  aspectRatio?: number;
  height?: DimensionValue | undefined;
  loop?: boolean;
  muted?: boolean;
  src: string;
  width?: DimensionValue | undefined;
}
