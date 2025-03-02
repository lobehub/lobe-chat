import { CrawlUrlRule } from '../type';

export const applyUrlRules = (
  url: string,
  urlRules: CrawlUrlRule[],
): {
  filterOptions?: CrawlUrlRule['filterOptions'];
  impls?: string[];
  transformedUrl: string;
} => {
  for (const rule of urlRules) {
    // 转换为正则表达式
    const regex = new RegExp(rule.urlPattern);
    const match = url.match(regex);

    if (match) {
      if (rule.urlTransform) {
        // 如果有转换规则，进行 URL 转换
        // 替换 $1, $2 等占位符为捕获组内容
        const transformedUrl = rule.urlTransform.replaceAll(
          /\$(\d+)/g,
          (_, index) => match[parseInt(index)] || '',
        );

        return {
          filterOptions: rule.filterOptions,
          impls: rule.impls,
          transformedUrl,
        };
      } else {
        // 没有转换规则但匹配了模式，只返回过滤选项
        return {
          filterOptions: rule.filterOptions,
          impls: rule.impls,
          transformedUrl: url,
        };
      }
    }
  }

  // 没有匹配任何规则，返回原始 URL
  return { transformedUrl: url };
};
