export const TEXT_READABLE_FILE_TYPES = [
  // Plain Text & Markup
  'txt',
  'md',
  'markdown',
  'mdx',

  // Configuration & Data
  'json',
  'xml',
  'yaml',
  'yml',
  'toml',
  'ini',
  'cfg',
  'conf',
  'csv',

  // Web Development
  'html',
  'htm',
  'css',
  'scss',
  'less',
  'js',
  'jsx',
  'ts',
  'tsx',
  'mjs',
  'vue',
  'svelte',
  'svg',

  // Scripting & Programming
  'php',
  'py',
  'rb',
  'java',
  'c',
  'cpp',
  'h',
  'hpp',
  'cs',
  'go',
  'rs',
  'swift',
  'kt',
  'sh',
  'bash',
  'bat',
  'ps1',

  // Other
  'log',
  'sql',
  'patch',
  'diff',
  'db', // Often text-based, like SQLite journals
];

/**
 * Determine if a file can be read as text based on its extension.
 * @param fileType File extension (without the leading dot)
 * @returns Whether the file is likely text-readable
 */
export function isTextReadableFile(fileType: string): boolean {
  return TEXT_READABLE_FILE_TYPES.includes(fileType.toLowerCase());
}
