import { Slider, Text, createStyles } from '@lobehub/ui-rn';
import { useState } from 'react';
import { View } from 'react-native';

const useStyles = createStyles(({ token }) => ({
  container: {
    padding: token.padding,
  },
  customMarkLabel: {
    backgroundColor: token.colorPrimaryBg,
    borderRadius: token.borderRadiusSM,
    paddingBlock: 2,
    paddingInline: token.paddingXXS,
  },
  customMarkText: {
    color: token.colorPrimary,
    fontSize: token.fontSize,
  },
  section: {
    marginBottom: token.marginXL,
  },
  sliderWrapper: {
    marginVertical: token.marginLG,
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

const MarksSliderDemo = () => {
  const { styles } = useStyles();
  const [performance, setPerformance] = useState(2);
  const [temperature, setTemperature] = useState(20);
  const [rating, setRating] = useState(3);

  // 性能等级刻度
  const performanceMarks = {
    0: '低',
    1: '中',
    2: '高',
    3: '极高',
  };

  // 温度刻度（带自定义样式）
  const temperatureMarks = {
    16: '16°C',
    18: '18°C',
    20: {
      label: <Text style={styles.customMarkText}>舒适</Text>,
      style: styles.customMarkLabel,
    },
    22: '22°C',
    24: '24°C',
    26: '26°C',
  };

  // 评分刻度
  const ratingMarks = {
    1: '⭐',
    2: '⭐⭐',
    3: '⭐⭐⭐',
    4: '⭐⭐⭐⭐',
    5: '⭐⭐⭐⭐⭐',
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>性能等级选择</Text>
        <Text style={styles.valueText}>
          当前等级: {performanceMarks[performance as keyof typeof performanceMarks]}
        </Text>
        <View style={styles.sliderWrapper}>
          <Slider
            marks={performanceMarks}
            max={3}
            min={0}
            onChange={setPerformance}
            step={null} // 使用 marks-only 模式
            value={performance}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>温度控制（带自定义标签）</Text>
        <Text style={styles.valueText}>当前温度: {temperature}°C</Text>
        <View style={styles.sliderWrapper}>
          <Slider
            marks={temperatureMarks}
            max={26}
            min={16}
            onChange={setTemperature}
            step={1}
            value={temperature}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>评分选择</Text>
        <Text style={styles.valueText}>当前评分: {rating} 星</Text>
        <View style={styles.sliderWrapper}>
          <Slider
            marks={ratingMarks}
            max={5}
            min={1}
            onChange={setRating}
            step={null} // 只能选择刻度值
            value={rating}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>带步长的刻度</Text>
        <Text style={styles.valueText}>可以在刻度间任意滑动</Text>
        <View style={styles.sliderWrapper}>
          <Slider
            defaultValue={50}
            marks={{
              0: '0%',
              25: '25%',
              50: '50%',
              75: '75%',
              // eslint-disable-next-line sort-keys-fix/sort-keys-fix
              100: '100%',
            }}
            max={100}
            min={0}
            onChange={(val) => console.log('Value:', val)}
            step={25}
          />
        </View>
      </View>
    </View>
  );
};

export default MarksSliderDemo;
