import { Flexbox, Highlighter, Text } from '@lobehub/ui-rn';

const fullFeaturedExamples = [
  {
    code: `import React, { useState, useEffect } from 'react';
import { View, Button } from 'react-native';

interface CounterProps {
  initialValue?: number;
  onValueChange?: (value: number) => void;
}

const Counter: React.FC<CounterProps> = ({
  initialValue = 0,
  onValueChange
}) => {
  const [count, setCount] = useState(initialValue);

  useEffect(() => {
    onValueChange?.(count);
  }, [count, onValueChange]);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);

  return (
    <View>
      <Text>{count}</Text>
      <Button title="-" onPress={decrement} />
      <Button title="+" onPress={increment} />
    </View>
  );
};`,
    description: '包含工具栏、复制功能、展开收起',
    lang: 'typescript',
    title: 'TypeScript 组件',
  },
  {
    allowChangeLanguage: true,
    code: `# React Native 项目

## 环境要求
- Node.js >= 16
- React Native CLI

## 安装依赖
\`\`\`bash
npm install
\`\`\`

## 运行项目
\`\`\`bash
npx react-native run-ios
npx react-native run-android
\`\`\``,
    description: 'Markdown 文档示例',
    lang: 'markdown',
    title: 'Markdown 文档',
  },
];

export default () => {
  return (
    <Flexbox gap={24}>
      {fullFeaturedExamples.map((example, index) => (
        <Flexbox gap={8} key={index}>
          <Text as="h4" strong>
            {example.title}
          </Text>
          <Text type="secondary">{example.description}</Text>
          <Highlighter
            allowChangeLanguage={example.allowChangeLanguage}
            code={example.code}
            copyable
            fullFeatured
            lang={example.lang}
            showLanguage
          />
        </Flexbox>
      ))}
    </Flexbox>
  );
};
