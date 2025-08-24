import React, { useState } from 'react';
import { View, Text } from 'react-native';

import { createStyles } from '@/theme';

import Slider from '../index';

const useStyles = createStyles((token) => ({
  container: {
    padding: token.padding,
  },
  customThumb: {
    backgroundColor: token.colorSuccess,
    borderColor: token.colorSuccessBorder,
    height: 24,
    marginLeft: -12,
    marginTop: -9,
    width: 24,
  },
  customTrack: {
    backgroundColor: token.colorWarning,
    height: 6,
  },
  largeThumb: {
    height: 28,
    marginLeft: -14,
    marginTop: -10,
    width: 28,
  },
  section: {
    marginBottom: token.marginLG,
  },
  sliderWrapper: {
    marginVertical: token.marginMD,
  },
  thickTrack: {
    height: 8,
  },
  title: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: '600',
    marginBottom: token.marginSM,
  },
  valueText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    marginBottom: token.marginXS,
  },
}));

const CustomSliderDemo: React.FC = () => {
  const { styles } = useStyles();
  const [value1, setValue1] = useState(30);
  const [value2, setValue2] = useState(65);
  const [value3, setValue3] = useState(45);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>自定义颜色</Text>
        <Text style={styles.valueText}>当前值: {value1}%</Text>
        <View style={styles.sliderWrapper}>
          <Slider
            max={100}
            min={0}
            onChange={setValue1}
            step={5}
            thumbStyle={styles.customThumb}
            trackStyle={styles.customTrack}
            value={value1}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>加粗样式</Text>
        <Text style={styles.valueText}>当前值: {value2}</Text>
        <View style={styles.sliderWrapper}>
          <Slider
            max={100}
            min={0}
            onChange={setValue2}
            step={1}
            thumbStyle={styles.largeThumb}
            trackStyle={styles.thickTrack}
            value={value2}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>紧凑样式</Text>
        <Text style={styles.valueText}>当前值: {value3}</Text>
        <View style={styles.sliderWrapper}>
          <Slider
            max={100}
            min={0}
            onChange={setValue3}
            step={1}
            style={{ paddingVertical: 8 }}
            value={value3}
          />
        </View>
      </View>
    </View>
  );
};

export default CustomSliderDemo;
