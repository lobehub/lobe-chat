import { isMatch } from 'micromatch';

import { CrawlUrlRule } from '../type';

export const applyUrlRules = (
  url: string,
  urlRules: CrawlUrlRule[],
): {
  filterOptions?: CrawlUrlRule['filterOptions'];
  transformedUrl: string;
} => {
  for (const rule of urlRules) {
    // 检查URL是否匹配规则
    let isMatched = false;
    let capturedGroups: string[] = [];

    if (rule.isRegex) {
      // 使用正则表达式匹配
      const regex = new RegExp(rule.urlPattern);
      const match = url.match(regex);
      if (match) {
        isMatched = true;
        capturedGroups = match.slice(1); // 获取捕获组
      }
    } else {
      // 使用glob模式匹配
      isMatched = isMatch(url, rule.urlPattern);

      // 对于glob模式，我们需要手动提取"通配符"部分
      if (isMatched && rule.urlTransform) {
        // 将glob模式转换为正则表达式来提取捕获组
        const globToRegex = (pattern: string) => {
          return new RegExp(
            '^' +
              pattern
                .replaceAll('**', '(.*)') // ** 匹配任意字符
                .replaceAll('*', '([^/]*)') // * 匹配非斜杠字符
                .replaceAll('/', '\\/') +
              '$',
          );
        };

        const regex = globToRegex(rule.urlPattern);
        const match = url.match(regex);
        if (match) {
          capturedGroups = match.slice(1);
        }
      }
    }

    if (isMatched) {
      // 如果有URL转换规则，应用转换
      if (rule.urlTransform) {
        let transformedUrl = rule.urlTransform;

        // 替换占位符 $1, $2 等为捕获组的值
        capturedGroups.forEach((group, index) => {
          transformedUrl = transformedUrl.replace(`$${index + 1}`, group);
        });

        return {
          filterOptions: rule.filterOptions,
          transformedUrl,
        };
      }

      // 如果只有过滤选项而没有URL转换
      return {
        filterOptions: rule.filterOptions,
        transformedUrl: url,
      };
    }
  }

  // 如果没有匹配的规则，返回原始URL
  return { transformedUrl: url };
};
