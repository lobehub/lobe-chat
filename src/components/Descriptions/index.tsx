import { Grid, type GridProps, Icon, IconProps, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { CSSProperties, ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import CopyableLabel from '../CopyableLabel';

const useStyles = createStyles(({ responsive, css, token }) => {
  return {
    bordered: css`
      overflow: hidden;
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadiusLG}px;
      ${responsive.mobile} {
        background: ${token.colorBgContainer};
      }
    `,
    cell: css`
      overflow: hidden;
      box-shadow: 0 0 0 0.5px ${token.colorBorderSecondary};
    `,
    label: css`
      overflow: hidden;
      border-inline-end: 1px solid ${token.colorBorderSecondary};
      background: ${token.colorFillQuaternary};
    `,
  };
});

export interface DescriptionItem {
  copyable?: boolean;
  icon?: IconProps['icon'];
  key: string;
  label: ReactNode;
  style?: CSSProperties;
  value: ReactNode;
}

interface DescriptionsProps extends Omit<GridProps, 'children'> {
  bordered?: boolean;
  items: DescriptionItem[];
  labelWidth?: number | string;
}

const Descriptions = memo<DescriptionsProps>(
  ({ labelWidth = 150, title, bordered, className, items, ...rest }) => {
    const { cx, styles, theme } = useStyles();

    return (
      <>
        {title && <h3 style={{ marginTop: 12 }}>{title}</h3>}
        <Grid
          className={cx(bordered && styles.bordered, className)}
          gap={0}
          maxItemWidth={450}
          {...rest}
        >
          {items.map((item) => (
            <Flexbox
              align={'center'}
              className={cx(bordered && styles.cell)}
              flex={1}
              horizontal
              key={item.key}
              style={{
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Flexbox
                align={'center'}
                className={cx(bordered && styles.label)}
                flex={'none'}
                gap={6}
                horizontal
                paddingBlock={bordered ? 12 : 4}
                paddingInline={bordered ? 16 : 0}
                style={{ height: '100%', position: 'relative' }}
                width={labelWidth}
              >
                {item.icon && <Icon color={theme.colorTextSecondary} icon={item.icon} />}
                <Text
                  ellipsis
                  style={{
                    color: theme.colorTextSecondary,
                  }}
                >
                  {item.label}
                </Text>
              </Flexbox>
              <Flexbox
                align={'center'}
                flex={1}
                horizontal
                justify={'flex-start'}
                paddingBlock={bordered ? 12 : 4}
                paddingInline={16}
                style={{ height: '100%', overflow: 'hidden', position: 'relative' }}
              >
                {item.copyable ? (
                  <CopyableLabel
                    style={item.style}
                    value={item.value ? String(item.value) : '--'}
                  />
                ) : (
                  <Text ellipsis style={{ ...item.style }}>
                    {item.value}
                  </Text>
                )}
              </Flexbox>
            </Flexbox>
          ))}
        </Grid>
      </>
    );
  },
);

export default Descriptions;
