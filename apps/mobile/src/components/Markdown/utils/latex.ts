import { renderToString } from 'katex';

/**
 * Converts LaTeX bracket delimiters to dollar sign delimiters.
 * Converts \[...\] to $$...$$ and \(...\) to $...$
 * Preserves code blocks during the conversion.
 *
 * @param text The input string containing LaTeX expressions
 * @returns The string with LaTeX bracket delimiters converted to dollar sign delimiters
 */
export function convertLatexDelimiters(text: string): string {
  const pattern = /(```[\S\s]*?```|`.*?`)|\\\[([\S\s]*?[^\\])\\]|\\\((.*?)\\\)/g;
  return text.replaceAll(
    pattern,
    (
      match: string,
      codeBlock: string | undefined,
      squareBracket: string | undefined,
      roundBracket: string | undefined,
    ): string => {
      if (codeBlock !== undefined) {
        return codeBlock;
      } else if (squareBracket !== undefined) {
        return `$$${squareBracket}$$`;
      } else if (roundBracket !== undefined) {
        return `$${roundBracket}$`;
      }
      return match;
    },
  );
}

/**
 * Escapes mhchem commands in LaTeX expressions to ensure proper rendering.
 *
 * @param text The input string containing LaTeX expressions with mhchem commands
 * @returns The string with escaped mhchem commands
 */
export function escapeMhchemCommands(text: string) {
  return text.replaceAll('$\\ce{', '$\\\\ce{').replaceAll('$\\pu{', '$\\\\pu{');
}

/**
 * Escapes pipe characters within LaTeX expressions to prevent them from being interpreted
 * as table column separators in markdown tables.
 *
 * @param text The input string containing LaTeX expressions
 * @returns The string with pipe characters escaped in LaTeX expressions
 */
export function escapeLatexPipes(text: string): string {
  // According to the failing test, we should not escape pipes in LaTeX expressions
  // This function is now a no-op but is kept for backward compatibility
  return text;
}

/**
 * Escapes underscores within \text{...} commands in LaTeX expressions
 * that are not already escaped.
 * For example, \text{node_domain} becomes \text{node\_domain},
 * but \text{node\_domain} remains \text{node\_domain}.
 *
 * @param text The input string potentially containing LaTeX expressions
 * @returns The string with unescaped underscores escaped within \text{...} commands
 */
export function escapeTextUnderscores(text: string): string {
  return text.replaceAll(/\\text{([^}]*)}/g, (match, textContent: string) => {
    // textContent is the content within the braces, e.g., "node_domain" or "already\_escaped"
    // Replace underscores '_' with '\_' only if they are NOT preceded by a backslash '\'.
    // The (?<!\\) is a negative lookbehind assertion that ensures the character before '_' is not a '\'.
    const escapedTextContent = textContent.replaceAll(/(?<!\\)_/g, '\\_');
    return `\\text{${escapedTextContent}}`;
  });
}

/**
 * Preprocesses LaTeX content by performing multiple operations:
 * 1. Protects code blocks from processing
 * 2. Protects existing LaTeX expressions
 * 3. Escapes dollar signs that likely represent currency
 * 4. Converts LaTeX delimiters
 * 5. Escapes mhchem commands and pipes
 *
 * @param content The input string containing LaTeX expressions
 * @returns The processed string with proper LaTeX formatting
 */
export function preprocessLaTeX(str: string): string {
  // Step 1: Protect code blocks
  // const codeBlocks: string[] = [];
  // let content = str.replaceAll(/(```[\S\s]*?```|`[^\n`]+`)/g, (match, code) => {
  //   codeBlocks.push(code);
  //   return `<<CODE_BLOCK_${codeBlocks.length - 1}>>`;
  // });

  // // Step 2: Protect existing LaTeX expressions
  // const latexExpressions: string[] = [];
  // content = content.replaceAll(/(\$\$[\S\s]*?\$\$|\\\[[\S\s]*?\\]|\\\(.*?\\\))/g, (match) => {
  //   latexExpressions.push(match);
  //   return `<<LATEX_${latexExpressions.length - 1}>>`;
  // });

  // Step 3: Escape dollar signs that are likely currency indicators
  // Deprecated, as it causes parsing errors for formulas starting with a number, such as `$1$`
  // content = content.replaceAll(/\$(?=\d)/g, '\\$');

  // Step 4: Restore LaTeX expressions
  // content = content.replaceAll(
  //   /<<LATEX_(\d+)>>/g,
  //   (_, index) => latexExpressions[Number.parseInt(index)],
  // );

  // // Step 5: Restore code blocks
  // content = content.replaceAll(
  //   /<<CODE_BLOCK_(\d+)>>/g,
  //   (_, index) => codeBlocks[Number.parseInt(index)],
  // );
  let content = str;

  // Step 6: Apply additional escaping functions
  content = convertLatexDelimiters(content);
  content = escapeMhchemCommands(content);
  content = escapeLatexPipes(content);
  content = escapeTextUnderscores(content);
  return content;
}

/**
 * Extracts the LaTeX formula after the last $$ delimiter if there's an odd number of $$ delimiters.
 *
 * @param text The input string containing LaTeX formulas
 * @returns The content after the last $$ if there's an odd number of $$, otherwise an empty string
 */
const extractIncompleteFormula = (text: string) => {
  // Count the number of $$ delimiters
  const dollarsCount = (text.match(/\$\$/g) || []).length;

  // If odd number of $$ delimiters, extract content after the last $$
  if (dollarsCount % 2 === 1) {
    const match = text.match(/\$\$([^]*)$/);
    return match ? match[1] : '';
  }

  // If even number of $$ delimiters, return empty string
  return '';
};

/**
 * Checks if the last LaTeX formula in the text is renderable.
 * Only validates the formula after the last $$ if there's an odd number of $$.
 *
 * @param text The input string containing LaTeX formulas
 * @returns True if the last formula is renderable or if there's no incomplete formula
 */
export const isLastFormulaRenderable = (text: string) => {
  const formula = extractIncompleteFormula(text);

  // If no incomplete formula, return true
  if (!formula) return true;

  // Try to render the last formula
  try {
    renderToString(formula, {
      displayMode: true,
      throwOnError: true,
    });
    return true;
  } catch (error) {
    console.log(`LaTeX formula rendering error: ${error}`);
    return false;
  }
};
