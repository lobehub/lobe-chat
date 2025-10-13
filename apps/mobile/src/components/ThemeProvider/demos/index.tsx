import { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import CustomAlgorithmDemo from './customAlgorithm';
import CustomTokenDemo from './customToken';
import CustomTokenAndAlgorithmDemo from './customTokenAndAlgorithm';
import MultipleAlgorithmsDemo from './multipleAlgorithms';

const demos: DemoConfig = [
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

export default demos;
