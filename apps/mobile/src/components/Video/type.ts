import type { VideoViewProps } from 'expo-video';
import type { DimensionValue } from 'react-native';

import type { BlockProps } from '../Block';

export interface VideoProps
  extends Omit<VideoViewProps, 'player'>,
    Pick<BlockProps, 'variant' | 'borderRadius'> {
  aspectRatio?: number;
  height?: DimensionValue | undefined;
  loop?: boolean;
  muted?: boolean;
  src: string;
  width?: DimensionValue | undefined;
}
