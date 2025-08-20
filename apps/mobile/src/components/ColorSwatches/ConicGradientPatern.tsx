import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect } from 'react-native-svg';

interface ConicPatternProps {
  fillColor: string;
  height?: number;
  width?: number; // 对应 token.colorFillSecondary
}

const styles = StyleSheet.create({
  appContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  container: {},
});

// 创建方形路径
const createSquare = (x: number, y: number, width: number, height: number) => {
  return `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`;
};

const ConicGradientPattern: React.FC<ConicPatternProps> = ({
  width = 200,
  height = 200,
  fillColor,
}) => {
  // 单元格尺寸
  const patternSize = width / 2;

  return (
    <View style={[styles.container, { height, width }]}>
      <Svg height={height} width={width}>
        <Defs>
          <Pattern
            height={patternSize}
            id="conicPattern"
            patternUnits="userSpaceOnUse"
            width={patternSize}
          >
            {/* 左上方形 - 填充颜色 */}
            <Path d={createSquare(0, 0, patternSize / 2, patternSize / 2)} fill={fillColor} />

            {/* 右上方形 - 透明 */}
            <Path
              d={createSquare(patternSize / 2, 0, patternSize / 2, patternSize / 2)}
              fill="transparent"
            />

            {/* 左下方形 - 透明 */}
            <Path
              d={createSquare(0, patternSize / 2, patternSize / 2, patternSize / 2)}
              fill="transparent"
            />

            {/* 右下方形 - 填充颜色 */}
            <Path
              d={createSquare(patternSize / 2, patternSize / 2, patternSize / 2, patternSize / 2)}
              fill={fillColor}
            />
          </Pattern>
        </Defs>

        {/* 使用定义的图案填充整个区域 */}
        <Rect fill="url(#conicPattern)" height={height} width={width} x="0" y="0" />
      </Svg>
    </View>
  );
};

export default ConicGradientPattern;
