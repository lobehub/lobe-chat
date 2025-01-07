import {
  StatisticCard as AntdStatisticCard,
  StatisticCardProps as AntdStatisticCardProps,
} from '@ant-design/pro-components';
import { Spin, Typography } from 'antd';
import { createStyles, useResponsive } from 'antd-style';
import { adjustHue } from 'polished';
import { memo } from 'react';

const { Title } = Typography;

const useStyles = createStyles(
  ({ isDarkMode, css, token, prefixCls, responsive }, highlight: string = '#000') => ({
    card: css`
      border: 1px solid ${isDarkMode ? token.colorFillTertiary : token.colorFillSecondary};
      border-radius: ${token.borderRadiusLG}px;

      ${responsive.mobile} {
        border: none;
        border-radius: 0;
        background: ${token.colorBgContainer};
      }
    `,
    container: css`
      ${responsive.mobile} {
        border: none;
        border-radius: 0;
        background: ${token.colorBgContainer};
      }

      .${prefixCls}-pro-card-title {
        overflow: hidden;

        ${responsive.mobile} {
          margin: 0;
          font-size: 14px;
          line-height: 16px !important;
        }
      }

      .${prefixCls}-pro-card-body {
        padding: 0;
        .${prefixCls}-pro-statistic-card-content {
          position: relative;
          width: 100%;
          padding-block-end: 16px;
          padding-inline: 24px;
          .${prefixCls}-pro-statistic-card-chart {
            position: relative;
            width: 100%;
          }
        }

        .${prefixCls}-pro-statistic-card-footer {
          overflow: hidden;

          margin: 0;
          padding: 0;
          border-end-start-radius: ${token.borderRadiusLG}px;
          border-end-end-radius: ${token.borderRadiusLG}px;
        }
      }

      .${prefixCls}-pro-card-loading-content {
        padding-block: 16px;
        padding-inline: 24px;
      }

      .${prefixCls}-pro-card-header {
        padding-block-start: 16px;
        padding-inline: 24px;

        .${prefixCls}-pro-card-title {
          line-height: 32px;
        }

        + .${prefixCls}-pro-card-body {
          padding-block-start: 0;
        }

        ${responsive.mobile} {
          flex-wrap: wrap;
          gap: 8px;

          margin-block-end: 8px;
          padding-block-start: 0;
          padding-inline: 0;
        }
      }

      .${prefixCls}-statistic-content-value-int, .${prefixCls}-statistic-content-value-decimal {
        font-size: 24px;
        font-weight: bold;
        line-height: 1.2;
      }

      .${prefixCls}-pro-statistic-card-chart {
        margin: 0;
      }

      .${prefixCls}-pro-statistic-card-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        ${responsive.mobile} {
          padding-block-end: 0 !important;
          padding-inline: 0 !important;
        }
      }

      .${prefixCls}-pro-statistic-card-content-horizontal {
        flex-direction: row;
        align-items: center;

        .${prefixCls}-pro-statistic-card-chart {
          align-self: center;
        }
      }
    `,
    highlight: css`
      overflow: hidden;

      &::before {
        content: '';

        position: absolute;
        z-index: 0;
        inset-block-end: -30%;
        inset-inline-end: -30%;
        transform: rotate(-15deg);

        width: 66%;
        height: 50%;
        border-radius: 50%;

        opacity: ${isDarkMode ? 1 : 0.33};
        background-image: linear-gradient(
          60deg,
          ${adjustHue(-30, highlight)} 20%,
          ${highlight} 80%
        );
        background-repeat: no-repeat;
        background-position: center left;
        background-size: contain;
        filter: blur(32px);
      }

      > div {
        z-index: 1;
      }
    `,
    icon: css`
      border-radius: ${token.borderRadius}px;
      background: ${token.colorFillSecondary};
    `,
    pure: css`
      border: none !important;
      background: transparent !important;
    `,
  }),
);

interface StatisticCardProps extends AntdStatisticCardProps {
  highlight?: string;
  variant?: 'pure' | 'card';
}

const StatisticCard = memo<StatisticCardProps>(
  ({ title, className, highlight, variant, loading, extra, ...rest }) => {
    const { cx, styles } = useStyles(highlight);
    const { mobile } = useResponsive();
    const isPure = variant === 'pure';
    return (
      <AntdStatisticCard
        bordered={!mobile}
        className={cx(
          styles.container,
          isPure ? styles.pure : styles.card,
          highlight && styles.highlight,
          className,
        )}
        extra={loading ? <Spin percent={'auto'} size={'small'} /> : extra}
        title={
          typeof title === 'string' ? (
            <Title
              ellipsis={{ rows: 1, tooltip: title }}
              level={2}
              style={{
                fontSize: 'inherit',
                fontWeight: 'inherit',
                lineHeight: 'inherit',
                margin: 0,
                overflow: 'hidden',
              }}
            >
              {title}
            </Title>
          ) : (
            title
          )
        }
        {...rest}
      />
    );
  },
);

export default StatisticCard;
