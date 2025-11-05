import React, { memo } from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export interface BrandDividerProps extends SvgProps {
  /**
   * 尺寸（宽度和高度相同）
   * @default 24
   */
  size?: number;
}

const BrandDivider = memo<BrandDividerProps>(
  ({ size = 24, style, color = 'currentColor', ...rest }) => {
    return (
      <Svg
        fill="none"
        height={size}
        style={[{ flexShrink: 0 }, style]}
        viewBox="0 0 24 24"
        width={size}
        {...rest}
      >
        <Path
          d="M16.88 3.549L7.12 20.451"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  },
);

BrandDivider.displayName = 'BrandDivider';

export default BrandDivider;
