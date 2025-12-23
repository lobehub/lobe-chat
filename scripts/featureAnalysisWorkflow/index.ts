import { Octokit } from '@octokit/rest';
import fs from 'fs/promises';
import path from 'path';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const OWNER = 'lobehub';
const REPO = 'lobe-chat';
const OUTPUT_DIR = 'docs/usage/features';

interface FeatureRequest {
  number: number;
  title: string;
  state: string;
  reactions: number;
  totalReactions: number;
  comments: number;
  labels: string;
  url: string;
  createdAt: string;
}

/**
 * 获取所有功能请求
 */
async function fetchFeatureRequests(maxPages = 15): Promise<any[]> {
  console.log('📊 正在获取功能请求数据...\n');

  const allIssues: any[] = [];
  const perPage = 100;

  for (let page = 1; page <= maxPages; page++) {
    try {
      const response = await octokit.search.issuesAndPullRequests({
        q: `repo:${OWNER}/${REPO} [Request] in:title is:issue`,
        sort: 'reactions-+1',
        order: 'desc',
        per_page: perPage,
        page: page,
      });

      if (response.data.items.length === 0) break;

      allIssues.push(...response.data.items);
      console.log(`  ✓ 第 ${page} 页: 获取 ${response.data.items.length} 个请求 (总计: ${allIssues.length})`);

      if (response.data.items.length < perPage) break;

      // 避免API限流
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error(`获取第 ${page} 页时出错:`, error.message);
      break;
    }
  }

  console.log(`\n✓ 总计获取 ${allIssues.length} 个功能请求\n`);
  return allIssues;
}

/**
 * 分析和分类功能请求
 */
function analyzeFeatures(issues: any[]): {
  topFeatures: FeatureRequest[];
  stats: { total: number; open: number; closed: number };
  categories: Map<string, number>;
} {
  const topFeatures: FeatureRequest[] = issues.slice(0, 50).map((issue) => ({
    number: issue.number,
    title: issue.title.replace('[Request] ', ''),
    state: issue.state,
    reactions: issue.reactions['+1'] || 0,
    totalReactions: issue.reactions.total_count || 0,
    comments: issue.comments || 0,
    labels: issue.labels?.map((l: any) => l.name).join(', ') || '',
    url: issue.html_url,
    createdAt: issue.created_at,
  }));

  const stats = {
    total: issues.length,
    open: issues.filter((i) => i.state === 'open').length,
    closed: issues.filter((i) => i.state === 'closed').length,
  };

  const categories = new Map<string, number>();
  issues.forEach((issue) => {
    const labels = issue.labels?.map((l: any) => l.name) || [];
    labels.forEach((label: string) => {
      if (label.startsWith('feature:') || label.startsWith('provider:')) {
        categories.set(label, (categories.get(label) || 0) + 1);
      }
    });
  });

  return { topFeatures, stats, categories };
}

/**
 * 生成Markdown报告
 */
function generateMarkdownReport(data: {
  topFeatures: FeatureRequest[];
  stats: { total: number; open: number; closed: number };
  categories: Map<string, number>;
}): string {
  const { topFeatures, stats, categories } = data;
  const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  let md = `---
title: 用户需求反馈分析
description: LobeChat用户最关注的功能需求统计分析
tags:
  - 功能需求
  - 用户反馈
  - 社区
---

# 用户需求反馈分析

<Callout type="info">
本文档基于GitHub Issues自动生成，展示用户反馈最多的功能需求。

最后更新: ${now}
</Callout>

## 📊 概览统计

- **总功能请求**: ${stats.total}
- **已完成**: ${stats.closed}
- **进行中/待处理**: ${stats.open}

## 🔥 用户反馈最多的功能 TOP 30

以下功能按用户赞同数（👍）排序:

`;

  // 表格
  md += `| 排名 | 状态 | 功能需求 | 👍 | 💬 | Issue |\n`;
  md += `| :--: | :--: | :------- | :-: | :-: | :---- |\n`;

  topFeatures.slice(0, 30).forEach((f, idx) => {
    const status = f.state === 'closed' ? '✅' : '⏳';
    const titleShort = f.title.length > 70 ? f.title.substring(0, 67) + '...' : f.title;
    md += `| ${idx + 1} | ${status} | ${titleShort} | ${f.reactions} | ${f.comments} | [#${f.number}](${f.url}) |\n`;
  });

  md += `\n<Callout type="tip">\n`;
  md += `✅ 表示已完成，⏳ 表示进行中或待处理\n`;
  md += `</Callout>\n\n`;

  // 分类统计
  md += `## 📂 热门功能分类\n\n`;
  const sortedCategories = Array.from(categories.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  sortedCategories.forEach(([cat, count]) => {
    const displayName = cat.replace('feature:', '').replace('provider:', '');
    md += `- **${displayName}**: ${count} 个请求\n`;
  });

  // 详细描述前10
  md += `\n## 💡 TOP 10 详细说明\n\n`;
  topFeatures.slice(0, 10).forEach((f, idx) => {
    const status = f.state === 'closed' ? '✅ 已完成' : '⏳ 进行中';
    md += `### ${idx + 1}. ${status} ${f.title}\n\n`;
    md += `- **赞同**: ${f.reactions} 👍\n`;
    md += `- **讨论**: ${f.comments} 💬\n`;
    md += `- **Issue**: [#${f.number}](${f.url})\n`;
    if (f.labels) {
      md += `- **标签**: \`${f.labels}\`\n`;
    }
    md += `\n`;
  });

  // 趋势观察
  md += `## 📈 趋势观察\n\n`;
  md += `根据用户反馈数据，我们观察到以下趋势:\n\n`;
  md += `1. **AI能力扩展** - 新模型支持、思考过程可视化等需求持续增长\n`;
  md += `2. **多模态交互** - 图像、语音、文件处理的需求明显增加\n`;
  md += `3. **企业部署** - 认证、权限、服务端配置等企业级功能需求上升\n`;
  md += `4. **知识库重要性** - RAG、文档处理、知识管理相关需求热度高\n`;
  md += `5. **用户体验** - 性能优化、界面改进的需求持续存在\n\n`;

  md += `## 🤝 参与贡献\n\n`;
  md += `如果您有新的功能建议，欢迎:\n\n`;
  md += `- 📝 [提交功能请求](https://github.com/${OWNER}/${REPO}/issues/new?template=2_feature_request.yml)\n`;
  md += `- 💬 在已有Issue中参与讨论\n`;
  md += `- 👍 为您关注的功能点赞\n`;

  return md;
}

/**
 * 生成JSON数据文件
 */
function generateJSONData(data: {
  topFeatures: FeatureRequest[];
  stats: { total: number; open: number; closed: number };
  categories: Map<string, number>;
}): string {
  return JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      stats: data.stats,
      topFeatures: data.topFeatures,
      categories: Object.fromEntries(
        Array.from(data.categories.entries()).sort((a, b) => b[1] - a[1]),
      ),
    },
    null,
    2,
  );
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 LobeChat 功能需求分析工具\n');

    // 1. 获取数据
    const issues = await fetchFeatureRequests();

    if (issues.length === 0) {
      console.log('⚠️  未获取到任何数据');
      return;
    }

    // 2. 分析数据
    console.log('📊 正在分析数据...\n');
    const analysis = analyzeFeatures(issues);

    // 3. 生成报告
    console.log('📝 正在生成报告...\n');
    const markdownReport = generateMarkdownReport(analysis);
    const jsonData = generateJSONData(analysis);

    // 4. 确保输出目录存在
    const outputPath = path.join(process.cwd(), OUTPUT_DIR);
    await fs.mkdir(outputPath, { recursive: true });

    // 5. 保存文件
    await fs.writeFile(path.join(outputPath, 'user-feedback-analysis.mdx'), markdownReport, 'utf8');
    await fs.writeFile(path.join(outputPath, 'feature-requests-data.json'), jsonData, 'utf8');

    console.log(`✅ 报告已生成:\n`);
    console.log(`   📄 ${path.join(OUTPUT_DIR, 'user-feedback-analysis.mdx')}`);
    console.log(`   📊 ${path.join(OUTPUT_DIR, 'feature-requests-data.json')}\n`);

    // 6. 打印摘要
    console.log('=== 数据摘要 ===\n');
    console.log(`总功能请求数: ${analysis.stats.total}`);
    console.log(`已完成: ${analysis.stats.closed}`);
    console.log(`进行中: ${analysis.stats.open}\n`);
    console.log('TOP 5 最受关注功能:\n');
    analysis.topFeatures.slice(0, 5).forEach((f, idx) => {
      const status = f.state === 'closed' ? '✅' : '⏳';
      console.log(`${idx + 1}. ${status} ${f.title} (${f.reactions}👍)`);
    });
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
