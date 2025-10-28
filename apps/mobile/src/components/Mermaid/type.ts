import type { StyleProp, ViewStyle } from 'react-native';

import type { BlockProps } from '@/components/Block';

export interface MermaidProps extends Omit<BlockProps, 'children'> {
  code: string;
  copyable?: boolean;
  defalutExpand?: boolean;
  fileName?: string;
  fullFeatured?: boolean;
  onCopy?: (code: string) => void;
  showLanguage?: boolean;
  style?: StyleProp<ViewStyle>;
}
