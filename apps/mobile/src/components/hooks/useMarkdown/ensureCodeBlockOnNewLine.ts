/**
 * 确保代码块（```）独立成行
 * 处理在列表或段落中间出现的代码块，使其前后都有空行
 * 保留语言标识符（如 ```jsx, ```python 等）
 * 并去除代码块及其内容的前导缩进
 */
export const ensureCodeBlockOnNewLine = (content: string): string => {
  // 先处理行内的代码块标记（同一行中有其他内容+代码块）
  let processed = content;

  // 处理：非空白字符后直接跟着```language
  processed = processed.replaceAll(/(\S)\s*(```[\w-]*)\s*$/gm, '$1\n\n$2');

  const lines = processed.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 检测代码块开始
    const codeBlockMatch = trimmed.match(/^```([\w-]*)$/);

    if (codeBlockMatch) {
      const language = codeBlockMatch[1];

      // 检查前一行是否有内容（不是空行）
      if (result.length > 0 && result?.at(-1)?.trim() !== '') {
        result.push(''); // 添加空行
      }

      // 添加代码块开始标记（无缩进）
      result.push(`\`\`\`${language}`);
      i++;

      // 收集代码块内容
      const codeLines: string[] = [];
      while (i < lines.length) {
        const codeLine = lines[i];
        if (/^```$/.test(codeLine.trim())) {
          // 找到结束标记
          break;
        }
        codeLines.push(codeLine);
        i++;
      }

      // 检测最小缩进
      const indents = codeLines
        .filter((l) => l.trim().length > 0)
        .map((l) => l.match(/^(\s*)/)?.[1].length || 0);
      const minIndent = indents.length > 0 ? Math.min(...indents) : 0;

      // 去除统一缩进
      const dedentedCode = codeLines.map((l) => (l.trim().length > 0 ? l.slice(minIndent) : l));

      // 清理末尾的空行
      while (dedentedCode.length > 0 && dedentedCode?.at(-1)?.trim() === '') {
        dedentedCode.pop();
      }

      result.push(...dedentedCode);

      // 添加结束标记
      if (i < lines.length) {
        result.push('```\n');
        i++;
      }
    } else {
      // 普通行，直接添加
      result.push(line);
      i++;
    }
  }

  // // 清理多余的连续空行
  let cleaned = result.join('\n');

  return cleaned;
};
