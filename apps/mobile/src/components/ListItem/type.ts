import type { Href } from 'expo-router';
import type { ReactNode } from 'react';

export interface ListItemProps {
  active?: boolean;
  avatar?: string | ReactNode;
  description?: string;
  extra?: ReactNode;
  href?: Href;
  /**
   * 类似 onClick，必须要透传，否则上层无法响应点击事件
   */
  onPress?: () => void;
  title: string;
}
