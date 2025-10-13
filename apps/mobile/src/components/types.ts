import type { ReactNode } from 'react';

/**
 * Demo 项配置
 * 用于 Playground 组件展示各组件的演示示例
 */
export interface DemoItem {
  /**
   * Demo 组件实例
   */
  component: ReactNode;
  /**
   * Demo 唯一标识
   */
  key: string;
  /**
   * Demo 标题
   */
  title: string;
}

/**
 * Demo 配置列表
 */
export type DemoConfig = DemoItem[];
