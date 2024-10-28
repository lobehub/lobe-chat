import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { XIcon } from 'lucide-react';

export const useStyles = createStyles(({ css, token, prefixCls, isDarkMode, responsive }) => {
  return {
    content: css`
      .${prefixCls}-modal-content {
        overflow: hidden;

        width: min(90vw, 450px);
        padding: 0;

        background: ${isDarkMode ? token.colorBgElevated : token.colorBgLayout};
        border: 1px solid ${token.colorSplit};
        border-radius: ${token.borderRadiusLG}px;

        ${responsive.mobile} {
          width: unset;
        }
      }
      .${prefixCls}-modal-confirm-title {
        display: block;
        padding-block: 16px 0;
        padding-inline: 16px;
      }
      .${prefixCls}-modal-confirm-btns {
        margin-block-start: 0;
        padding: 16px;
      }
    `,
    wrap: css`
      overflow: hidden auto;
    `,
  };
});

export const closeIcon = <Icon icon={XIcon} size={{ fontSize: 20 }} />;
