import type { ViewProps } from 'react-native';

export interface EmojiCategory {
  name: string;
  symbol: string | null;
}

export interface EmojiObject {
  category: string;
  obsoleted_by?: string;
  short_names: string[];
  sort_order: number;
  unified: string;
}

export interface EmojiSelectorProps extends Omit<ViewProps, 'onLayout'> {
  /**
   * 初始选中的分类
   * @default Categories.activities
   */
  category?: EmojiCategory;

  /**
   * 每行显示的列数（不设置则根据屏幕宽度自动计算）
   */
  columns?: number;

  /**
   * 默认值
   */
  defaultValue?: string;

  /**
   * 单个 emoji 的尺寸（用于自动计算列数）
   * @default 48
   */
  emojiSize?: number;

  /**
   * 选中 emoji 的回调
   */
  onChange?: (emoji: string) => void;

  /**
   * 搜索框占位符
   * @default 'Search...'
   */
  placeholder?: string;

  /**
   * 过滤 emoji 的函数
   */
  shouldInclude?: (emoji: EmojiObject) => boolean;

  /**
   * 是否显示搜索栏
   * @default true
   */
  showSearchBar?: boolean;

  /**
   * 是否显示分类标签
   * @default true
   */
  showTabs?: boolean;

  /**
   * 受控值
   */
  value?: string;
}

export interface EmojiCellProps {
  active?: boolean;
  colSize: number;
  emoji: EmojiObject;
  onPress: () => void;
}
