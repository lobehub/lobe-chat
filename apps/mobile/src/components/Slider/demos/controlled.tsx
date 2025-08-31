import React, { useState, useCallback } from 'react';
import { View, Text } from 'react-native';

import Button from '@/components/Button';
import { createStyles } from '@/theme';

import Slider from '../index';

const useStyles = createStyles((token) => ({
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: token.marginXS,
    marginTop: token.marginSM,
  },
  container: {
    padding: token.padding,
  },
  infoText: {
    color: token.colorTextTertiary,
    fontSize: token.fontSizeSM,
    marginTop: token.marginSM,
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

const ControlledSliderDemo: React.FC = () => {
  const { styles } = useStyles();
  const [progress, setProgress] = useState(50);
  const [lastCompleteValue, setLastCompleteValue] = useState(50);

  const handleReset = useCallback(() => {
    setProgress(0);
    setLastCompleteValue(0);
  }, []);

  const handlePreset = useCallback((value: number) => {
    setProgress(value);
  }, []);

  const handleChangeComplete = useCallback((value: number) => {
    setLastCompleteValue(value);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>受控模式</Text>
        <Text style={styles.valueText}>当前进度: {progress}%</Text>
        <Text style={styles.valueText}>完成时的值: {lastCompleteValue}%</Text>

        <View style={styles.sliderWrapper}>
          <Slider
            max={100}
            min={0}
            onChange={setProgress}
            onChangeComplete={handleChangeComplete}
            step={5}
            value={progress}
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button onPress={handleReset} size="small">
            重置
          </Button>
          <Button onPress={() => handlePreset(25)} size="small" type="primary">
            25%
          </Button>
          <Button onPress={() => handlePreset(50)} size="small" type="primary">
            50%
          </Button>
          <Button onPress={() => handlePreset(75)} size="small" type="primary">
            75%
          </Button>
          <Button onPress={() => handlePreset(100)} size="small" type="primary">
            100%
          </Button>
        </View>

        <Text style={styles.infoText}>
          * onChange: 拖拽时实时触发{'\n'}* onChangeComplete: 拖拽结束时触发
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>非受控模式</Text>
        <Text style={styles.infoText}>使用 defaultValue，组件内部管理状态</Text>

        <View style={styles.sliderWrapper}>
          <Slider
            defaultValue={30}
            max={100}
            min={0}
            onChange={(value) => console.log('Uncontrolled value:', value)}
            onChangeComplete={(value) => console.log('Uncontrolled complete:', value)}
            step={10}
          />
        </View>
      </View>
    </View>
  );
};

export default ControlledSliderDemo;
