import { TextStyle, ViewStyle } from 'react-native';

import type {
  PresetColorKey,
  PresetStatusColorKey,
} from '@/components/styles/theme/interface/presetColors';

export type TagColor = PresetColorKey | PresetStatusColorKey;

export interface TagProps {
  border?: boolean;
  children: string;
  color?: TagColor;
  style?: ViewStyle;
  textStyle?: TextStyle;
}
