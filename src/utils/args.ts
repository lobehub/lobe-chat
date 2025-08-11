/**
 * Parse command line arguments string into array
 * Supports quoted arguments and escaped quotes
 * @param input - Command line arguments string
 * @returns Array of parsed arguments
 */
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
        // Handle escaped quotes
        current += quoteChar;
        i++; // Skip the escaped quote character
      } else if (char === quoteChar) {
        // End of quoted string
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

/**
 * Convert arguments array back to command line string
 * Automatically quotes arguments containing spaces or special characters
 * @param args - Array of arguments to convert
 * @returns Command line string with properly quoted arguments
 */
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
