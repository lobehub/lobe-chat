import { PageContainer } from '@lobehub/ui-rn';
import { useLocalSearchParams } from 'expo-router';
import { kebabCase } from 'lodash-es';
import { Text, View } from 'react-native';

import { DEMOS_MAP } from '../.data/import';
import playgroundData from '../.data/index.json';
import { getAllComponents } from '../utils';
import ComponentPlayground from './ComponentPlayground';

/**
 * 动态组件 Playground 页面
 * 根据路由参数自动加载对应组件的 demos 和 README
 */
export default function DynamicComponentPlaygroundPage() {
  const { component } = useLocalSearchParams<{ component: string }>();

  // 从 kebab-case 路径参数查找对应的组件配置
  const allComponents = getAllComponents();
  const componentConfig = allComponents.find((c) => kebabCase(c.name) === component);

  if (!componentConfig) {
    return (
      <PageContainer showBack title="组件未找到">
        <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <Text>组件 {component} 未找到</Text>
        </View>
      </PageContainer>
    );
  }

  const componentName = componentConfig.name;
  const componentData =
    playgroundData.components[componentName as keyof typeof playgroundData.components];
  const demos = DEMOS_MAP[componentName as keyof typeof DEMOS_MAP];

  if (!componentData) {
    return (
      <PageContainer showBack title={`${componentName} 组件`}>
        <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <Text>组件 {componentName} 的数据未配置</Text>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBack title={componentName}>
      <ComponentPlayground
        demos={demos || []}
        readmeContent={[componentData.description, componentData.readme]
          .filter(Boolean)
          .join('\n\n')}
      />
    </PageContainer>
  );
}
