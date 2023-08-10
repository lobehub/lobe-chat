import { Tag as AntTag, type TagProps as AntTagProps } from 'antd';
import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ cx, css, token }) => ({
  count: css`
    display: flex;
    align-items: center;

    height: 20px;
    padding: 0 8px;

    font-size: 12px;
    line-height: 1;

    background: ${token.colorFillTertiary};
    border: ${token.borderRadius}px;
  `,
  tag: cx(
    css`
      color: ${token.colorTextSecondary} !important;
      background: ${token.colorFillSecondary};
      border: ${token.borderRadius}px;

      &:hover {
        color: ${token.colorText};
        background: ${token.colorFill};
      }
    `,
  ),
}));

export interface TagProps extends AntTagProps {
  icon?: ReactNode;
}

const Tag = memo<TagProps>(({ icon, children, ...props }) => {
  const { styles } = useStyles();

  return (
    <AntTag bordered={false} className={styles.tag} {...props}>
      <Flexbox align={'center'} gap={4} horizontal>
        {icon}
        {children}
      </Flexbox>
    </AntTag>
  );
});

export default Tag;
