import { Icon } from '@lobehub/ui';
import { Collapse, CollapseProps } from 'antd';
import { createStyles } from 'antd-style';
import { ChevronDown } from 'lucide-react';
import { memo } from 'react';

const useStyles = createStyles(({ css, prefixCls, token, responsive }) => ({
  container: css`
    .${prefixCls}-collapse-header {
      padding-inline: 16px 10px !important;
      color: ${token.colorTextDescription} !important;
      border-radius: ${token.borderRadius}px !important;

      ${responsive.mobile} {
        border-radius: 0 !important;
      }

      &:hover {
        color: ${token.colorText} !important;
        background: ${token.colorFillTertiary};
      }
    }
    .${prefixCls}-collapse-content {
      border-radius: 0 !important;
    }
    .${prefixCls}-collapse-content-box {
      padding: 0 !important;
    }
  `,
  icon: css`
    transition: all 100ms ${token.motionEaseOut};
  `,
}));

const CollapseGroup = memo<CollapseProps>((props) => {
  const { styles } = useStyles();
  return (
    <Collapse
      bordered={false}
      className={styles.container}
      expandIcon={({ isActive }) => (
        <Icon
          className={styles.icon}
          icon={ChevronDown}
          size={{ fontSize: 16 }}
          style={isActive ? {} : { rotate: '-90deg' }}
        />
      )}
      expandIconPosition={'end'}
      ghost
      size={'small'}
      {...props}
    />
  );
});

export default CollapseGroup;
