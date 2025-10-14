import { DemoConfig } from '@lobehub/ui-rn';

import BasicDemo from './basic';
import RequiredMarkDemo from './requiredMark';
import UseFormDemo from './useForm';
import ValidatorDemo from './validator';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <UseFormDemo />, key: 'use-form', title: '使用 Form.useForm' },
  { component: <RequiredMarkDemo />, key: 'required-mark', title: '必填标记' },
  { component: <ValidatorDemo />, key: 'validator', title: '自定义校验' },
];

export default demos;
