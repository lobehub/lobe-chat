import { UIChatMessage } from '@lobechat/types';
import { MarkdownProps } from '@lobehub/ui-rn';

export interface ChatItemProps {
  /**
   * @description Whether the chat item is in loading state
   */
  isLoading?: boolean;
  /**
   * @description Markdown rendering props
   */
  markdownProps?: Partial<MarkdownProps>;
  /**
   * @description The message data
   */
  message: UIChatMessage;
  /**
   * @description Whether to show actions (context menu, action bar)
   * @default true
   */
  showActions?: boolean;
  /**
   * @description Whether to show actions bar
   */
  showActionsBar?: boolean;
  /**
   * @description Whether to show time
   * @default true
   */
  showTime?: boolean;
  /**
   * @description Whether to show title
   * @default true
   */
  showTitle?: boolean;
}
