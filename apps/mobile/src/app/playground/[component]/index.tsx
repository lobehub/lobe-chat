import { Empty, NativePageContainer } from '@lobehub/ui-rn';
import { useLocalSearchParams } from 'expo-router';
import { kebabCase } from 'lodash-es';

import { DEMOS_MAP } from '../_data/import';
import playgroundData from '../_data/index.json';
import { getAllComponents } from '../_features/utils';
import ComponentPlayground from './_features/ComponentPlayground';

/**
 * 动态组件 Playground 页面
 * 根据路由参数自动加载对应组件的 demos 和 README
 */
export default function DynamicComponentPlaygroundPage() {
  const { component } = useLocalSearchParams<{ component: string }>();

  // 从 kebab-case 路径参数查找对应的组件配置
  const allComponents = getAllComponents();
  const componentConfig = allComponents.find((c) => kebabCase(c.name) === component);

  let componentName = '组件';
  let content;

  if (!componentConfig) {
    content = <Empty description={`组件 ${component} 未找到`} />;
  } else {
    componentName = componentConfig.name;
    const componentData =
      playgroundData.components[componentName as keyof typeof playgroundData.components];
    const demos = DEMOS_MAP[componentName as keyof typeof DEMOS_MAP];

    if (!componentData) {
      content = <Empty description={`组件 ${componentName} 的数据未配置`} />;
    } else {
      content = (
        <ComponentPlayground
          demos={demos || []}
          readmeContent={[componentData.description, componentData.readme]
            .filter(Boolean)
            .join('\n\n')}
        />
      );
    }
  }

  return (
    <NativePageContainer autoBack title={componentName}>
      {content}
    </NativePageContainer>
  );
}
