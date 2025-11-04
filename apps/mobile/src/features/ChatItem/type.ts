import { UIChatMessage } from '@lobechat/types';
import { MarkdownProps } from '@lobehub/ui-rn';
import { ReactNode } from 'react';

export interface MetaData {
  avatar?: string;
  backgroundColor?: string;
  title?: string;
}

export interface ChatItemProps {
  /**
   * @description Content to render above the message
   */
  aboveMessage?: ReactNode;
  /**
   * @description Action buttons or elements
   */
  actions?: ReactNode;
  /**
   * @description Avatar metadata
   */
  avatar: MetaData;
  /**
   * @description Content to render below the message
   */
  belowMessage?: ReactNode;
  /**
   * @description Error information
   */
  error?: UIChatMessage['error'];
  /**
   * @description Custom error message render
   */
  errorMessage?: ReactNode;
  /**
   * @description Whether the chat item is in loading state
   */
  loading?: boolean;
  /**
   * @description Markdown rendering props
   */
  markdownProps?: Partial<MarkdownProps>;
  /**
   * @description The message content
   */
  message?: string;
  /**
   * @description Extra content after message
   */
  messageExtra?: ReactNode;
  /**
   * @description The placement of the chat item
   * @default 'left'
   */
  placement?: 'left' | 'right';
  /**
   * @description Whether the chat item is primary (user message)
   */
  primary?: boolean;
  /**
   * @description Custom message render function
   */
  renderMessage?: (content: ReactNode) => ReactNode;
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
  /**
   * @description The timestamp of the chat item
   */
  time?: number;
  /**
   * @description The variant style
   * @default 'bubble'
   */
  variant?: 'bubble' | 'docs';
}
