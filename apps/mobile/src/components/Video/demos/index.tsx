import React from 'react';

import type { DemoConfig } from '@/components/types';

import BasicDemo from './basic';

const demos: DemoConfig = [{ component: <BasicDemo />, key: 'basic', title: '基础用法' }];

export default demos;
