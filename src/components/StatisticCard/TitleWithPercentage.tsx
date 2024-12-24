import { Tag, Typography } from 'antd';
import { useTheme } from 'antd-style';
import { CSSProperties, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { calcGrowthPercentage } from './growthPercentage';

const { Title } = Typography;

interface TitleWithPercentageProps {
  count?: number;
  inverseColor?: boolean;
  prvCount?: number;
  title: string;
}

const TitleWithPercentage = memo<TitleWithPercentageProps>(
  ({ inverseColor, title, prvCount, count }) => {
    const percentage = calcGrowthPercentage(count || 0, prvCount || 0);
    const theme = useTheme();

    const upStyle: CSSProperties = {
      background: theme.colorSuccessBg,
      borderColor: theme.colorSuccessBorder,
      color: theme.colorSuccess,
    };

    const downStyle: CSSProperties = {
      backgroundColor: theme.colorWarningBg,
      borderColor: theme.colorWarningBorder,
      color: theme.colorWarning,
    };

    return (
      <Flexbox
        align={'center'}
        gap={8}
        horizontal
        justify={'flex-start'}
        style={{
          overflow: 'hidden',
          position: 'inherit',
        }}
      >
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
        {count && prvCount && percentage && percentage !== 0 ? (
          <Tag
            style={{
              borderWidth: 0.5,
              ...(inverseColor
                ? percentage > 0
                  ? downStyle
                  : upStyle
                : percentage > 0
                  ? upStyle
                  : downStyle),
            }}
          >
            {percentage > 0 ? '+' : ''}
            {percentage.toFixed(1)}%
          </Tag>
        ) : null}
      </Flexbox>
    );
  },
);

export default TitleWithPercentage;
