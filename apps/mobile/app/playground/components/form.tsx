import { PageContainer } from '@lobehub/ui-rn';
import { BasicDemo, RequiredMarkDemo, UseFormDemo, ValidatorDemo } from '@lobehub/ui-rn/Form/demos';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

import README from '@/components/Form/README';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <UseFormDemo />, key: 'use-form', title: '使用 Form.useForm' },
  { component: <RequiredMarkDemo />, key: 'required-mark', title: '必填标记' },
  { component: <ValidatorDemo />, key: 'validator', title: '自定义校验' },
];

export default function FormPlaygroundPage() {
  return (
    <PageContainer showBack title="Form 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
