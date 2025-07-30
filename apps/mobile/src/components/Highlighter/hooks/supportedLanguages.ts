// 为显示做一些语言名称的美化
const languageDisplayNames: Record<string, string> = {
  bash: 'Bash',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  css: 'CSS',
  diff: 'Diff',
  go: 'Go',
  graphql: 'GraphQL',
  html: 'HTML',
  ini: 'INI',
  java: 'Java',
  javascript: 'JavaScript',
  json: 'JSON',
  jsx: 'JSX',
  kotlin: 'Kotlin',
  markdown: 'Markdown',
  mermaid: 'Mermaid',
  php: 'PHP',
  python: 'Python',
  ruby: 'Ruby',
  rust: 'Rust',
  scala: 'Scala',
  sql: 'SQL',
  swift: 'Swift',
  toml: 'TOML',
  tsx: 'TSX',
  typescript: 'TypeScript',
  xml: 'XML',
  yaml: 'YAML',
};

// 将ID转换为显示名称的辅助函数
export const getLanguageDisplayName = (id: string): string => {
  return languageDisplayNames[id] || id;
};

export { supportedLanguageIds as default } from '../contexts/highlighter';
