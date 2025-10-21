import { AlertProps, AvatarProps, DivProps, MarkdownProps } from '@lobehub/ui';
import { EditableMessageProps, MetaData } from '@lobehub/ui/chat';
import { ReactNode } from 'react';
import { FlexboxProps } from 'react-layout-kit';

export interface ChatItemProps extends Omit<FlexboxProps, 'children' | 'onChange'> {
  aboveMessage?: ReactNode;
  actions?: ReactNode;
  actionsWrapWidth?: number;
  avatar: MetaData;
  avatarAddon?: ReactNode;
  avatarProps?: AvatarProps;
  belowMessage?: ReactNode;
  /**
   * @description Whether the chat item is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * @description Whether the chat item is in editing mode
   */
  editing?: boolean;
  /**
   * @description Props for Error render
   */
  error?: AlertProps;
  errorMessage?: ReactNode;
  fontSize?: number;
  /**
   * @description Whether the chat item is in loading state
   */
  loading?: boolean;
  markdownProps?: Omit<MarkdownProps, 'className' | 'style' | 'children'>;
  /**
   * @description The message content of the chat item
   */
  message?: ReactNode;
  messageExtra?: ReactNode;
  onAvatarClick?: () => void;
  onDoubleClick?: DivProps['onDoubleClick'];
  /**
   * @default "..."
   */
  placeholderMessage?: string;
  /**
   * @description The placement of the chat item
   * @default 'left'
   */
  placement?: 'left' | 'right';
  /**
   * @description Whether the chat item is primary
   */
  primary?: boolean;
  renderMessage?: (content: ReactNode) => ReactNode;
  /**
   * @description Whether to hide the avatar
   * @default false
   */
  showAvatar?: boolean;
  /**
   * @description Whether to show the title of the chat item
   */
  showTitle?: boolean;
  text?: EditableMessageProps['text'];
  /**
   * @description The timestamp of the chat item
   */
  time?: number;
  titleAddon?: ReactNode;
  /**
   * @description The type of the chat item
   * @default 'bubble'
   */
  variant?: 'bubble' | 'docs';
}
