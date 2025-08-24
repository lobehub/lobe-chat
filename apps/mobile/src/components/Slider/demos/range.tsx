import React, { useState } from 'react';
import { View, Text } from 'react-native';

import { createStyles } from '@/theme';

import Slider from '../index';

const useStyles = createStyles((token) => ({
  container: {
    padding: token.padding,
  },
  section: {
    marginBottom: token.marginLG,
  },
  sliderWrapper: {
    marginVertical: token.marginMD,
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

const RangeSliderDemo: React.FC = () => {
  const { styles } = useStyles();
  const [price, setPrice] = useState(500);
  const [volume, setVolume] = useState(75);
  const [temperature, setTemperature] = useState(22);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>价格范围</Text>
        <Text style={styles.valueText}>当前价格: ¥{price}</Text>
        <View style={styles.sliderWrapper}>
          <Slider max={2000} min={100} onChange={setPrice} step={50} value={price} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>音量控制</Text>
        <Text style={styles.valueText}>当前音量: {volume}%</Text>
        <View style={styles.sliderWrapper}>
          <Slider max={100} min={0} onChange={setVolume} step={1} value={volume} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>温度设置</Text>
        <Text style={styles.valueText}>当前温度: {temperature}°C</Text>
        <View style={styles.sliderWrapper}>
          <Slider max={30} min={16} onChange={setTemperature} step={0.5} value={temperature} />
        </View>
      </View>
    </View>
  );
};

export default RangeSliderDemo;
