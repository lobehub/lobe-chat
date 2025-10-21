import { Flexbox, Tag, Text } from '@lobehub/ui-rn';
import {
  CheckIcon,
  CodeIcon,
  HeartIcon,
  RocketIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react-native';

const WithIconDemo = () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text fontSize={12} type="secondary">
          默认尺寸和颜色
        </Text>
        <Flexbox gap={8} horizontal wrap="wrap">
          <Tag icon={RocketIcon}>React Native</Tag>
          <Tag color="blue" icon={CodeIcon}>
            TypeScript
          </Tag>
          <Tag color="success" icon={CheckIcon}>
            Completed
          </Tag>
          <Tag color="error" icon={XIcon}>
            Error
          </Tag>
        </Flexbox>
      </Flexbox>

      <Flexbox gap={8}>
        <Text fontSize={12} type="secondary">
          不同尺寸
        </Text>
        <Flexbox gap={8} horizontal wrap="wrap">
          <Tag icon={RocketIcon} size="small">
            Small
          </Tag>
          <Tag color="blue" icon={CodeIcon} size="medium">
            Medium
          </Tag>
          <Tag color="purple" icon={SparklesIcon} size="large">
            Large
          </Tag>
        </Flexbox>
      </Flexbox>

      <Flexbox gap={8}>
        <Text fontSize={12} type="secondary">
          不同变体
        </Text>
        <Flexbox gap={8} horizontal wrap="wrap">
          <Tag color="blue" icon={CodeIcon} variant="filled">
            Filled
          </Tag>
          <Tag color="green" icon={CheckIcon} variant="outlined">
            Outlined
          </Tag>
          <Tag color="purple" icon={HeartIcon} variant="borderless">
            Borderless
          </Tag>
        </Flexbox>
      </Flexbox>

      <Flexbox gap={8}>
        <Text fontSize={12} type="secondary">
          自定义图标大小和颜色
        </Text>
        <Flexbox gap={8} horizontal wrap="wrap">
          <Tag color="blue" icon={SparklesIcon} iconSize={18}>
            自定义大小
          </Tag>
          <Tag icon={HeartIcon} iconProps={{ color: '#ff4d4f' }}>
            自定义颜色
          </Tag>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};

export default WithIconDemo;
