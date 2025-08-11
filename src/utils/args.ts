// 智能解析命令行参数
export const parseArgs = (input: string): string[] => {
  const args: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (!inQuotes) {
      if (char === '"' || char === "'") {
        inQuotes = true;
        quoteChar = char;
      } else if (char === ' ') {
        if (current.trim()) {
          args.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    } else {
      if (char === '\\' && i + 1 < input.length && input[i + 1] === quoteChar) {
        // 处理转义的引号
        current += quoteChar;
        i++; // 跳过下一个字符（被转义的引号）
      } else if (char === quoteChar) {
        // 结束引号
        inQuotes = false;
        quoteChar = '';
      } else {
        current += char;
      }
    }
    i++;
  }

  if (current.trim()) {
    args.push(current.trim());
  }

  return args;
};

export const argsToString = (args: string[]): string => {
  return args
    .map((arg) => {
      if (arg.includes(' ') || arg.includes('"') || arg.includes("'")) {
        if (arg.includes('"') && !arg.includes("'")) {
          return `'${arg}'`;
        } else {
          const escaped = arg.replaceAll('"', '\\"');
          return `"${escaped}"`;
        }
      }
      return arg;
    })
    .join(' ');
};
