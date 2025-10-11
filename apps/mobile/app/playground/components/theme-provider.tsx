import { PageContainer } from '@lobehub/ui-rn';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';

import README from '@/theme/ThemeProvider/README';
import {
  BasicDemo,
  CustomAlgorithmDemo,
  CustomTokenAndAlgorithmDemo,
  CustomTokenDemo,
  MultipleAlgorithmsDemo,
} from '@/theme/ThemeProvider/demos';

const themeProviderDemos: DemoItem[] = [
  {
    component: <BasicDemo />,
    key: 'basic',
    title: '基础用法',
  },
  {
    component: <CustomTokenDemo />,
    key: 'customToken',
    title: '自定义 Token',
  },
  {
    component: <CustomAlgorithmDemo />,
    key: 'customAlgorithm',
    title: '自定义算法',
  },
  {
    component: <CustomTokenAndAlgorithmDemo />,
    key: 'customTokenAndAlgorithm',
    title: 'Token + 算法',
  },
  {
    component: <MultipleAlgorithmsDemo />,
    key: 'multipleAlgorithms',
    title: '多算法组合',
  },
];

export default function ThemeProviderPlaygroundPage() {
  return (
    <PageContainer showBack title="ThemeProvider 组件">
      <ComponentPlayground demos={themeProviderDemos} readmeContent={README} />
    </PageContainer>
  );
}
