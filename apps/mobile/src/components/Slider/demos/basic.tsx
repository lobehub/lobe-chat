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

const BasicSliderDemo: React.FC = () => {
  const { styles } = useStyles();
  const [value1, setValue1] = useState(30);
  const [value2, setValue2] = useState(50);
  const [value3, setValue3] = useState(25);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>基础用法</Text>
        <Text style={styles.valueText}>当前值: {value1}</Text>
        <View style={styles.sliderWrapper}>
          <Slider max={100} min={0} onChange={setValue1} step={1} value={value1} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>自定义范围和步长</Text>
        <Text style={styles.valueText}>当前值: {value2} (步长: 5)</Text>
        <View style={styles.sliderWrapper}>
          <Slider max={90} min={10} onChange={setValue2} step={5} value={value2} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>禁用状态</Text>
        <Text style={styles.valueText}>当前值: {value3} (禁用)</Text>
        <View style={styles.sliderWrapper}>
          <Slider disabled max={100} min={0} onChange={setValue3} step={1} value={value3} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>带回调事件</Text>
        <View style={styles.sliderWrapper}>
          <Slider
            defaultValue={60}
            max={100}
            min={0}
            onChange={(val) => console.log('onChange:', val)}
            onChangeComplete={(val) => console.log('onChangeComplete:', val)}
            step={1}
          />
        </View>
      </View>
    </View>
  );
};

export default BasicSliderDemo;
