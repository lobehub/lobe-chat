import { Icon, Tooltip } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { HelpCircleIcon } from 'lucide-react';
import { CSSProperties, ReactNode, memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

export const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow: hidden;
    min-width: 64px;
  `,
  number: css`
    margin: 0 !important;

    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;
    text-align: center;
  `,
  title: css`
    margin: 0 !important;

    font-size: 12px;
    line-height: 1.2;
    color: ${token.colorTextSecondary};
    text-align: center;
  `,
}));

export interface StatisticProps extends Omit<FlexboxProps, 'children' | 'title'> {
  title: ReactNode;
  titleStyle?: CSSProperties;
  tooltip?: string;
  value: ReactNode;
  valuePlacement?: 'top' | 'bottom';
  valueStyle?: CSSProperties;
}

const Statistic = memo<StatisticProps>(
  ({
    className,
    valueStyle,
    titleStyle,
    valuePlacement = 'top',
    tooltip,
    title,
    value,
    ...rest
  }) => {
    const { cx, styles } = useStyles();
    const isTop = valuePlacement === 'top';
    const valueContent = (
      <Typography.Paragraph className={styles.number} ellipsis={{ rows: 1 }} style={valueStyle}>
        {value}
      </Typography.Paragraph>
    );
    const titleContent = (
      <Typography.Paragraph className={styles.title} ellipsis={{ rows: 1 }} style={titleStyle}>
        {title}
        {tooltip && <Icon icon={HelpCircleIcon} style={{ marginLeft: '0.4em' }} />}
      </Typography.Paragraph>
    );
    const content = (
      <Flexbox
        align={'center'}
        className={cx(styles.container, className)}
        flex={1}
        justify={'center'}
        {...rest}
      >
        {isTop ? (
          <>
            {valueContent}
            {titleContent}
          </>
        ) : (
          <>
            {titleContent}
            {valueContent}
          </>
        )}
      </Flexbox>
    );

    if (!tooltip) return content;

    return <Tooltip title={tooltip}>{content}</Tooltip>;
  },
);

export default Statistic;
