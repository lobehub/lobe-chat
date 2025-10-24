import type { StyleProp, ViewStyle } from 'react-native';

import type { BlockProps } from '@/components/Block';

export interface HighlighterProps extends Omit<BlockProps, 'children'> {
  /**
   * Whether to allow changing the language.
   */
  allowChangeLanguage?: boolean;
  /**
   * The code to be highlighted.
   */
  code: string;
  /**
   * Whether the code can be copied.
   */
  copyable?: boolean;
  /**
   * Whether the code is expanded by default.
   */
  defalutExpand?: boolean;
  fileName?: string;
  fullFeatured?: boolean;
  lang?: string;
  /**
   * Callback function called when code is copied.
   */
  onCopy?: (code: string) => void;
  showLanguage?: boolean;
  style?: StyleProp<ViewStyle>;
}
