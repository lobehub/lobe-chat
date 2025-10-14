import playgroundData from './.data/index.json';
import { ComponentItem } from './type';

/**
 * 从 index.json 获取所有组件（按字母顺序排序）
 */
export const getAllComponents = (): ComponentItem[] => {
  const components: ComponentItem[] = [];

  Object.entries(playgroundData.components).forEach(([name, config]) => {
    components.push({
      category: config.group,
      name,
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

  const components = getAllComponents().filter((c) => c.category === category);

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
  return playgroundData.groups;
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

/**
 * 按分组获取组件列表
 */
export const getComponentsByGroups = (): Record<string, ComponentItem[]> => {
  const groups: Record<string, ComponentItem[]> = {};
  const allComponents = getAllComponents();

  allComponents.forEach((component) => {
    if (!groups[component.category]) {
      groups[component.category] = [];
    }
    groups[component.category].push(component);
  });

  // 对每个分组内的组件按名称排序
  Object.keys(groups).forEach((group) => {
    groups[group].sort((a, b) => a.name.localeCompare(b.name));
  });

  return groups;
};
