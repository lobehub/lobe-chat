/**
 * 组件相关的类型定义
 */
import React from 'react';

export interface ComponentItem {
  category: 'basic' | 'layout' | 'feedback' | 'display' | 'animation' | 'form' | 'navigation';
  description: string;
  hasDemos: boolean;
  hasReadme: boolean;
  name: string;
  path: string;
  tags: string[];
}

export interface ComponentStats {
  beta: number;
  categories: number;
  demo: number;
  stable: number;
  tags: number;
  total: number;
  withDemos: number;
  withReadme: number;
}

export interface DemoConfig {
  code?: string;
  component: React.ComponentType<any>;
  description: string;
  name: string;
}

export interface ComponentConfig {
  component: ComponentItem;
  demos?: DemoConfig[];
  readme?: string;
}
