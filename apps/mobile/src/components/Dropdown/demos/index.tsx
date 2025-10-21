import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import DestructiveDemo from './destructive';
import DisabledDemo from './disabled';
import PlacementDemo from './placement';
import TriggerDemo from './trigger';
import WithoutIconDemo from './without-icon';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <TriggerDemo />, key: 'trigger', title: '触发方式' },
  { component: <PlacementDemo />, key: 'placement', title: '弹出位置' },
  { component: <DestructiveDemo />, key: 'destructive', title: '破坏性操作' },
  { component: <DisabledDemo />, key: 'disabled', title: '禁用选项' },
  { component: <WithoutIconDemo />, key: 'without-icon', title: '无图标' },
];

export default demos;
