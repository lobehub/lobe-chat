import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CapsuleTabs } from '@/components/CapsuleTabs';
import * as ThemeProviderDemos from '@/theme/ThemeProvider/demos';
import { useThemeToken } from '@/theme';

// ThemeProvider Demos 相关接口和组件

// ThemeProvider Demos 组件
interface DemoItem {
  component: React.ComponentType;
  description: string;
  key: string;
  title: string;
}

const themeProviderDemos: DemoItem[] = [
  {
    component: ThemeProviderDemos.basic,
    description: '使用默认主题配置，系统会根据当前模式（亮色/暗色）自动生成主题',
    key: 'basic',
    title: '基础用法',
  },
  {
    component: ThemeProviderDemos.customToken,
    description: '自定义种子 Token，如主色调、圆角等基础设计参数',
    key: 'customToken',
    title: '自定义 Token',
  },
  {
    component: ThemeProviderDemos.customAlgorithm,
    description: '使用自定义主题算法，如强制暗色模式等',
    key: 'customAlgorithm',
    title: '自定义算法',
  },
  {
    component: ThemeProviderDemos.customTokenAndAlgorithm,
    description: '同时自定义 Token 和算法，实现完全个性化的主题',
    key: 'customTokenAndAlgorithm',
    title: 'Token + 算法',
  },
  {
    component: ThemeProviderDemos.multipleAlgorithms,
    description: '组合多个主题算法，如暗色 + 紧凑算法的组合效果',
    key: 'multipleAlgorithms',
    title: '多算法组合',
  },
];

const ThemeProviderDemosSection: React.FC = () => {
  const token = useThemeToken();
  const [activeDemoTab, setActiveDemoTab] = useState(0);

  const currentDemo = themeProviderDemos[activeDemoTab];
  const DemoComponent = currentDemo.component;

  const demoTabItems = themeProviderDemos.map((demo) => ({
    key: demo.key,
    label: demo.title,
  }));

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          borderBottomColor: token.colorBorder,
          borderBottomWidth: token.lineWidth,
          paddingBottom: token.paddingMD,
          paddingHorizontal: token.padding,
          paddingTop: token.paddingSM,
        }}
      >
        <Text
          style={{
            color: token.colorText,
            fontSize: token.fontSizeHeading4,
            fontWeight: token.fontWeightStrong,
          }}
        >
          ThemeProvider 使用示例
        </Text>
        <Text
          style={{
            color: token.colorText,
            fontSize: token.fontSizeSM,
            marginTop: token.marginXS,
            opacity: 0.8,
          }}
        >
          展示如何使用自定义 theme 属性配置主题
        </Text>
      </View>

      <View
        style={{
          paddingHorizontal: token.padding,
          paddingVertical: token.paddingMD,
        }}
      >
        <CapsuleTabs
          items={demoTabItems}
          onSelect={(key: string) => {
            const index = themeProviderDemos.findIndex((demo) => demo.key === key);
            if (index !== -1) {
              setActiveDemoTab(index);
            }
          }}
          selectedKey={currentDemo.key}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          paddingHorizontal: token.padding,
        }}
      >
        <View style={{ marginBottom: token.marginXL }}>
          <Text
            style={{
              color: token.colorText,
              fontSize: token.fontSizeLG,
              fontWeight: token.fontWeightStrong,
            }}
          >
            {currentDemo.title}
          </Text>
          <Text
            style={{
              color: token.colorText,
              fontSize: token.fontSizeSM,
              marginTop: token.marginXS,
              opacity: 0.8,
            }}
          >
            {currentDemo.description}
          </Text>

          <View
            style={{
              backgroundColor: token.colorBgElevated,
              borderColor: token.colorBorder,
              borderRadius: token.borderRadiusLG,
              borderWidth: token.lineWidth,
              marginTop: token.marginMD,
              padding: token.paddingLG,
            }}
          >
            <DemoComponent />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// 主组件继续使用原有的结构，只在开头添加新的演示部分
export default function ThemeProviderPlayground() {
  const token = useThemeToken();

  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: token.colorBgLayout, flex: 1 }}>
      <ThemeProviderDemosSection />
    </SafeAreaView>
  );
}
