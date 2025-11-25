import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { shinyTextStylish } from '@/styles/loading';

export const useStyles = createStyles(({ css, token }) => ({
  apiName: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    text-overflow: ellipsis;
  `,

  expand: css`
    color: ${token.colorText};
  `,
  shinyText: shinyTextStylish(token),
}));

interface BuiltinPluginTitleProps {
  apiName: string;
  icon?: ReactNode;
  identifier: string;
  index: number;
  isExpanded?: boolean;
  isLoading?: boolean;
  messageId: string;
  title: string;
  toolCallId: string;
}

const BuiltinPluginTitle = memo<BuiltinPluginTitleProps>(
  ({ apiName, title, isLoading, isExpanded }) => {
    const { styles, cx } = useStyles();

    return (
      <Flexbox
        align={'center'}
        className={cx(isLoading && styles.shinyText, isExpanded && styles.expand)}
        gap={4}
        horizontal
      >
        <div>{title}</div>
        <Icon icon={ChevronRight} />
        <span className={styles.apiName}>{apiName}</span>
      </Flexbox>
    );
  },
);

export default BuiltinPluginTitle;
