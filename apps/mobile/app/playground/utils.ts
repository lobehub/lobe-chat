import { COMPONENT_CONFIG_TREE } from './config';
import { ComponentCategory, ComponentItem } from './type';

/**
 * 将树形配置转换为平面数组（按字母顺序排序）
 */
export const getAllComponents = (): ComponentItem[] => {
  const components: ComponentItem[] = [];

  (Object.keys(COMPONENT_CONFIG_TREE) as ComponentCategory[]).forEach((category) => {
    COMPONENT_CONFIG_TREE[category].forEach((name) => {
      components.push({ category, name });
    });
  });

  // 按组件名称的字母顺序排序
  return components.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * 根据分类获取组件列表（按字母顺序排序）
 */
export const getComponentsByCategory = (category?: string): ComponentItem[] => {
  if (!category) {
    return getAllComponents();
  }

  const names = COMPONENT_CONFIG_TREE[category as ComponentCategory] || [];
  const components = names.map((name) => ({ category: category as ComponentCategory, name }));

  // 按组件名称的字母顺序排序
  return components.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * 根据名称搜索组件（返回结果已按字母顺序排序）
 */
export const searchComponentsByName = (name: string): ComponentItem[] => {
  // getAllComponents() 已经返回了排序后的结果，filter 会保持顺序
  return getAllComponents().filter((component) =>
    component.name.toLowerCase().includes(name.toLowerCase()),
  );
};

/**
 * 获取所有分类
 */
export const getAllCategories = (): string[] => {
  return Object.keys(COMPONENT_CONFIG_TREE).filter(
    (category) => COMPONENT_CONFIG_TREE[category as ComponentCategory].length > 0,
  );
};

/**
 * 获取组件统计信息
 */
export const getComponentStats = () => {
  const total = getAllComponents().length;
  const categories = getAllCategories().length;

  return {
    categories,
    total,
  };
};
