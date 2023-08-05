import { SiOpenai } from '@icons-pack/react-simple-icons';
import { Tag as AntTag, type TagProps as AntTagProps } from 'antd';
import { createStyles } from 'antd-style';
import { capitalize as cap } from 'lodash-es';
import { type LucideIcon, Milestone, ToyBrick } from 'lucide-react';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ cx, css, token }, hasCount?: boolean) => ({
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
    hasCount &&
      css`
        padding-right: 0 !important;
      `,
  ),
}));

export interface TagProps extends AntTagProps {
  capitalize?: boolean;
  children: string;
  count?: number;
  icon?: ReactNode;
  type?: 'openai' | 'plugin' | 'version';
}

const Tag = memo<TagProps>(({ type = 'openai', icon, capitalize, count, children, ...props }) => {
  const { styles } = useStyles(Boolean(count && count > 1));
  let IconRender: LucideIcon | any;

  switch (type) {
    case 'openai': {
      IconRender = SiOpenai;
      break;
    }
    case 'version': {
      IconRender = Milestone;
      break;
    }
    case 'plugin': {
      IconRender = ToyBrick;
      break;
    }
  }

  return (
    <AntTag bordered={false} className={styles.tag} {...props}>
      <Flexbox align={'center'} gap={4} horizontal>
        {icon ? icon : <IconRender size={'1em'} />}
        {capitalize ? cap(children) : children}
        {count && <div className={styles.count}>{`${count}+`}</div>}
      </Flexbox>
    </AntTag>
  );
});

export default Tag;
