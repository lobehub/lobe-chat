import { createStyles } from 'antd-style';

export const useStyles = createStyles(
  (
    { cx, css, token, responsive },
    {
      placement,
      title,
      avatarSize,
      editing,
      time,
      disabled,
    }: {
      avatarSize?: number;
      disabled?: boolean;
      editing?: boolean;
      placement?: 'left' | 'right';
      primary?: boolean;
      showTitle?: boolean;
      time?: number;
      title?: string;
    },
  ) => {
    const blockStylish = css`
      padding-block: 8px;
      padding-inline: 12px;
      border-radius: ${token.borderRadiusLG}px;
      background-color: ${token.colorFillTertiary};
    `;

    const rawStylish = css`
      padding-block-start: ${title ? 0 : '6px'};
    `;

    const typeStylish = placement === 'right' ? blockStylish : rawStylish;

    const editingStylish =
      editing &&
      css`
        width: 100%;
      `;

    return {
      actions: cx(
        css`
          flex: none;
          align-self: flex-end;
          justify-content: ${placement === 'left' ? 'flex-end' : 'flex-start'};
        `,
        editing &&
          css`
            pointer-events: none !important;
            opacity: 0 !important;
          `,
      ),
      avatarContainer: css`
        position: relative;
        flex: none;
        width: ${avatarSize}px;
        height: ${avatarSize}px;
      `,
      avatarGroupContainer: css`
        width: ${avatarSize}px;
      `,
      container: css`
        position: relative;

        width: 100%;
        max-width: 100vw;
        padding-block: 24px 12px;
        padding-inline: 12px;

        @supports (content-visibility: auto) {
          contain-intrinsic-size: auto 100lvh;
        }

        time {
          display: inline-block;
          white-space: nowrap;
        }

        div[role='menubar'] {
          display: flex;
        }

        time,
        div[role='menubar'] {
          pointer-events: none;
          opacity: 0;
          transition: opacity 200ms ${token.motionEaseOut};
        }

        &:hover {
          time,
          div[role='menubar'] {
            pointer-events: unset;
            opacity: 1;
          }
        }

        ${responsive.mobile} {
          padding-block-start: 12px;
          padding-inline: 8px;
        }
      `,
      editingContainer: cx(
        editingStylish,
        css`
          padding-block: 8px 12px;
          padding-inline: 12px;
          border: 1px solid ${token.colorBorderSecondary};

          &:active,
          &:hover {
            border-color: ${token.colorBorder};
          }
        `,
      ),
      editingInput: css`
        width: 100%;
      `,
      errorContainer: css`
        position: relative;
        overflow: hidden;
        width: 100%;
      `,

      loading: css`
        position: absolute;
        inset-block-end: 0;
        inset-inline: ${placement === 'right' ? '-4px' : 'unset'}
          ${placement === 'left' ? '-4px' : 'unset'};

        width: 16px;
        height: 16px;
        border-radius: 50%;

        color: ${token.colorBgLayout};

        background: ${token.colorPrimary};
      `,
      message: cx(
        typeStylish,
        css`
          user-select: ${disabled ? 'none' : 'text'};

          position: relative;

          overflow: hidden;

          max-width: 100%;

          color: ${disabled ? token.colorTextSecondary : 'unset'};

          ${responsive.mobile} {
            width: 100%;
          }
        `,
      ),
      messageContainer: cx(
        editingStylish,
        css`
          position: relative;
          overflow: hidden;
          max-width: 100%;
          margin-block-start: ${time ? -16 : 0}px;

          ${responsive.mobile} {
            overflow-x: auto;
          }
        `,
      ),
      messageContent: cx(
        editingStylish,
        css`
          position: relative;
          overflow: hidden;
          max-width: 100%;

          ${responsive.mobile} {
            flex-direction: column !important;
          }
        `,
      ),
      messageExtra: cx('message-extra'),
      name: css`
        pointer-events: none;

        margin-block-end: 6px;

        font-size: 12px;
        line-height: 1;
        color: ${token.colorTextDescription};
        text-align: ${placement === 'left' ? 'left' : 'right'};
      `,
    };
  },
);
