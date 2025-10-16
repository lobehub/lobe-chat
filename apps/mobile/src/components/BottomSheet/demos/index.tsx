import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import ContentDemo from './content';
import NoCloseButtonDemo from './noCloseButton';
import NoPanToCloseDemo from './noPanToClose';
import SnapPointsDemo from './snapPoints';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SnapPointsDemo />, key: 'snap-points', title: '多快照点' },
  { component: <ContentDemo />, key: 'content', title: '复杂内容' },
  { component: <NoCloseButtonDemo />, key: 'no-close-button', title: '无关闭按钮' },
  { component: <NoPanToCloseDemo />, key: 'no-pan-to-close', title: '禁用下拉关闭' },
];

export default demos;
