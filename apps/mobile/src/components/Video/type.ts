import type { VideoViewProps } from 'expo-video';
import type { DimensionValue, PressableProps } from 'react-native';

export interface VideoProps
  extends Omit<VideoViewProps, 'player'>,
    Pick<PressableProps, 'onPress' | 'onLongPress'> {
  aspectRatio?: number;
  height?: DimensionValue | undefined;
  loop?: boolean;
  muted?: boolean;
  src: string;
  width?: DimensionValue | undefined;
}
