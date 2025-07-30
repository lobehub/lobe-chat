import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeToken } from '@/theme/context';

import MarkdownRender from '../index';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
  },
});

const advancedMarkdown = `# 高级 Markdown 示例

这个示例展示了更复杂的 Markdown 内容渲染。

## 表格

| 姓名 | 年龄 | 职业 |
|------|------|------|
| 张三 | 25   | 工程师 |
| 李四 | 30   | 设计师 |
| 王五 | 28   | 产品经理 |

## 代码高亮

支持多种编程语言的语法高亮：

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 打印前10个斐波那契数
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

## 任务列表

- [x] 完成基础功能
- [x] 添加测试用例
- [ ] 编写文档
- [ ] 性能优化

## 复杂嵌套

1. **主要功能**
   - *用户管理*
     - 注册登录
     - 权限控制
   - *内容管理*
     1. 创建内容
     2. 编辑内容
     3. 删除内容

2. **技术栈**
   > React Native + TypeScript
   > 
   > 使用现代化的技术栈构建

## 混合内容

这里是一段包含 \`inline code\` 的文本，以及一个[链接](https://example.com)。

**注意事项：**
- 支持 GFM (GitHub Flavored Markdown)
- 自动识别 URL: https://github.com
- 支持 emoji 🎉 🚀 ❤️

---

*最后更新时间：2024年1月*
`;

const AdvancedDemo = () => {
  const token = useThemeToken();

  return (
    <View style={[styles.container, { backgroundColor: token.colorBgLayout }]}>
      <Text style={[styles.title, { color: token.colorText }]}>高级 Markdown 渲染</Text>
      <View style={[styles.content, { backgroundColor: token.colorBgContainer }]}>
        <MarkdownRender content={advancedMarkdown} />
      </View>
    </View>
  );
};

export default AdvancedDemo;
