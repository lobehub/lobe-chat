import React, { memo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ColorScaleItem } from '../../theme/color/types';

import ScaleColumn from './ScaleColumn';
import { useStyles } from './style';

export interface ColorScalesProps {
  /**
   * @description Index of the mid highlight color in the scale
   */
  midHighLight: number;
  /**
   * @description Name of the color scale
   */
  name: string;
  /**
   * @description Color scale item object
   */
  scale: ColorScaleItem;
}

const ColorScales = memo<ColorScalesProps>(({ name, scale, midHighLight }) => {
  const { styles, token } = useStyles();

  // 创建颜色级别数组（跳过 0 和 12）
  const colorIndexes = Array.from({ length: scale.light.length })
    .map((_, index) => index)
    .filter((index) => index !== 0 && index !== 12);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* 标题行 - 显示四种模式 */}
        <View style={styles.headerRow}>
          <View style={styles.indexColumn}>
            <Text style={styles.headerText}>级别</Text>
          </View>
          <View style={styles.colorColumn}>
            <Text style={styles.headerText}>light</Text>
          </View>
          <View style={styles.colorColumn}>
            <Text style={styles.headerText}>lightA</Text>
          </View>
          <View style={styles.colorColumn}>
            <Text style={styles.headerText}>dark</Text>
          </View>
          <View style={styles.colorColumn}>
            <Text style={styles.headerText}>darkA</Text>
          </View>
        </View>

        {/* 颜色行 - 每个级别一行 */}
        {colorIndexes.map((index) => {
          const isMidHighlight = midHighLight === index;

          return (
            <View key={index} style={styles.colorRow}>
              {/* 级别索引 */}
              <View style={styles.indexColumn}>
                <Text
                  style={[
                    styles.indexText,
                    {
                      color: isMidHighlight ? token.colorPrimary : token.colorTextSecondary,
                      fontWeight: isMidHighlight ? '700' : '400',
                    },
                  ]}
                >
                  {index}
                </Text>
              </View>

              {/* 四种颜色模式 */}
              <ScaleColumn
                color={scale.light[index]}
                index={index}
                isAlpha={false}
                name={name}
                type="light"
              />
              <ScaleColumn
                color={scale.lightA[index]}
                index={index}
                isAlpha={true}
                name={name}
                type="lightA"
              />
              <ScaleColumn
                color={scale.dark[index]}
                index={index}
                isAlpha={false}
                name={name}
                type="dark"
              />
              <ScaleColumn
                color={scale.darkA[index]}
                index={index}
                isAlpha={true}
                name={name}
                type="darkA"
              />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
});

ColorScales.displayName = 'ColorScales';

export default ColorScales;
