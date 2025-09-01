import {
  convertLatexDelimiters,
  escapeLatexPipes,
  escapeMhchemCommands,
  escapeTextUnderscores,
  isLastFormulaRenderable,
  preprocessLaTeX,
} from './latex';

describe('preprocessLaTeX', () => {
  test('returns the same string if no LaTeX patterns are found', () => {
    const content = 'This is a test string without LaTeX';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  // test('escapes dollar signs followed by digits', () => {
  //   const content = 'Price is $50 and $100';
  //   const expected = 'Price is \\$50 and \\$100';
  //   expect(preprocessLaTeX(content)).toBe(expected);
  // });

  test('does not escape dollar signs not followed by digits', () => {
    const content = 'This $variable is not escaped';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  test('preserves existing LaTeX expressions', () => {
    const content = 'Inline $x^2 + y^2 = z^2$ and block $$E = mc^2$$';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  // test('handles mixed LaTeX and currency', () => {
  //   const content = 'LaTeX $x^2$ and price $50';
  //   const expected = 'LaTeX $x^2$ and price \\$50';
  //   expect(preprocessLaTeX(content)).toBe(expected);
  // });

  test('converts LaTeX delimiters', () => {
    const content = 'Brackets \\[x^2\\] and parentheses \\(y^2\\)';
    const expected = 'Brackets $$x^2$$ and parentheses $y^2$';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('escapes mhchem commands', () => {
    const content = '$\\ce{H2O}$ and $\\pu{123 J}$';
    const expected = '$\\\\ce{H2O}$ and $\\\\pu{123 J}$';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles complex mixed content', () => {
    const content = `
      LaTeX inline $x^2$ and block $$y^2$$
      Chemical $\\ce{H2O}$
      Brackets \\[z^2\\]
    `;
    const expected = `
      LaTeX inline $x^2$ and block $$y^2$$
      Chemical $\\\\ce{H2O}$
      Brackets $$z^2$$
    `;
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  test('handles empty string', () => {
    expect(preprocessLaTeX('')).toBe('');
  });

  test('preserves code blocks', () => {
    const content = '```\n$100\n```\nOutside $200';
    const expected = '```\n$100\n```\nOutside $200';
    expect(preprocessLaTeX(content)).toBe(expected);
  });

  // test('handles multiple currency values in a sentence', () => {
  //   const content = 'I have $50 in my wallet and $100 in the bank.';
  //   const expected = 'I have \\$50 in my wallet and \\$100 in the bank.';
  //   expect(preprocessLaTeX(content)).toBe(expected);
  // });

  test('preserves LaTeX expressions with numbers', () => {
    const content = 'The equation is $f(x) = 2x + 3$ where x is a variable.';
    expect(preprocessLaTeX(content)).toBe(content);
  });

  // test('handles currency values with commas', () => {
  //   const content = 'The price is $1,000,000 for this item.';
  //   const expected = 'The price is \\$1,000,000 for this item.';
  //   expect(preprocessLaTeX(content)).toBe(expected);
  // });

  test('preserves LaTeX expressions with special characters', () => {
    const content = 'The set is defined as $\\{x | x > 0\\}$.';
    expect(preprocessLaTeX(content)).toBe(content);
  });
});

describe('convertLatexDelimiters', () => {
  test('converts brackets to dollar sign delimiters', () => {
    const content = 'Brackets \\[x^2\\] and parentheses \\(y^2\\)';
    const expected = 'Brackets $$x^2$$ and parentheses $y^2$';
    expect(convertLatexDelimiters(content)).toBe(expected);
  });

  test('preserves code blocks', () => {
    const content = '```\n\\[formula\\]\n```\nOutside \\[formula\\]';
    const expected = '```\n\\[formula\\]\n```\nOutside $$formula$$';
    expect(convertLatexDelimiters(content)).toBe(expected);
  });

  test('handles mixed content', () => {
    const content = 'Text \\[x^2\\] `code with \\[y^2\\]` and \\(z^2\\)';
    const expected = 'Text $$x^2$$ `code with \\[y^2\\]` and $z^2$';
    expect(convertLatexDelimiters(content)).toBe(expected);
  });

  test('handles empty string', () => {
    expect(convertLatexDelimiters('')).toBe('');
  });
});

describe('escapeMhchemCommands', () => {
  test('escapes mhchem ce command', () => {
    const content = '$\\ce{H2O}$';
    const expected = '$\\\\ce{H2O}$';
    expect(escapeMhchemCommands(content)).toBe(expected);
  });

  test('escapes mhchem pu command', () => {
    const content = '$\\pu{123 J}$';
    const expected = '$\\\\pu{123 J}$';
    expect(escapeMhchemCommands(content)).toBe(expected);
  });

  test('escapes multiple mhchem commands', () => {
    const content = '$\\ce{H2O}$ and $\\pu{123 J}$';
    const expected = '$\\\\ce{H2O}$ and $\\\\pu{123 J}$';
    expect(escapeMhchemCommands(content)).toBe(expected);
  });

  test('does not affect text without mhchem commands', () => {
    const content = '$x^2 + y^2 = z^2$';
    expect(escapeMhchemCommands(content)).toBe(content);
  });
});

describe('escapeLatexPipes', () => {
  test('does not escape pipes in LaTeX expressions', () => {
    const content = 'Set notation $\\{x | x > 0\\}$';
    expect(escapeLatexPipes(content)).toBe(content);
  });

  test('preserves pipes in block LaTeX', () => {
    const content = 'Set notation $$\\{x | x > 0\\}$$';
    expect(escapeLatexPipes(content)).toBe(content);
  });

  test('preserves pipes outside LaTeX', () => {
    const content = 'a | b';
    expect(escapeLatexPipes(content)).toBe(content);
  });

  test('preserves pipes in multiple LaTeX expressions', () => {
    const content = '$\\{x | x > 0\\}$ and $$\\{y | y < 0\\}$$';
    expect(escapeLatexPipes(content)).toBe(content);
  });
});

describe('isLastFormulaRenderable', () => {
  test('returns true for empty string', () => {
    expect(isLastFormulaRenderable('')).toBe(true);
  });

  test('returns true for complete formulas', () => {
    expect(isLastFormulaRenderable('$$x^2 + y^2 = z^2$$')).toBe(true);
  });

  test('returns true when no incomplete formula exists', () => {
    expect(isLastFormulaRenderable('$$formula1$$ and $$formula2$$')).toBe(true);
  });

  test('attempts to render incomplete formula', () => {
    expect(isLastFormulaRenderable('Text $$formula1$$')).toBe(true);

    // This should attempt to render "x^{" and return false since it's invalid
    // Note: This test assumes that "x^{" is invalid LaTeX which the renderer will reject
    expect(isLastFormulaRenderable('Text $$formula1$$ $$x^{')).toBe(false);
  });
});

describe('escapeTextUnderscores', () => {
  test('escapes underscores within \\text{} commands', () => {
    const content = '$\\text{node_domain}$';
    const expected = '$\\text{node\\_domain}$';
    expect(escapeTextUnderscores(content)).toBe(expected);
  });

  test('escapes multiple underscores within \\text{} commands', () => {
    const content = '$\\text{node_domain_name}$';
    const expected = '$\\text{node\\_domain\\_name}$';
    expect(escapeTextUnderscores(content)).toBe(expected);
  });

  test('escapes underscores in multiple \\text{} commands', () => {
    const content = '$\\text{node_domain}$ and $\\text{user_name}$';
    const expected = '$\\text{node\\_domain}$ and $\\text{user\\_name}$';
    expect(escapeTextUnderscores(content)).toBe(expected);
  });

  test('does not affect text without \\text{} commands', () => {
    const content = 'This is a regular_text with underscores';
    expect(escapeTextUnderscores(content)).toBe(content);
  });

  test('does not escape underscores in \\text{} commands with \\text{} commands', () => {
    const content = '$\\text{node\\_domain}$ and $\\text{user\\_name}$';
    const expected = '$\\text{node\\_domain}$ and $\\text{user\\_name}$';
    expect(escapeTextUnderscores(content)).toBe(expected);
  });

  test('does not modify \\text{} commands without underscores', () => {
    const content = '$\\text{regular text}$';
    expect(escapeTextUnderscores(content)).toBe(content);
  });

  test('handles complex mixed content', () => {
    const content =
      'LaTeX $x^2 + \\text{var_name}$ and $\\text{no underscore} + \\text{with_score}$';
    const expected =
      'LaTeX $x^2 + \\text{var\\_name}$ and $\\text{no underscore} + \\text{with\\_score}$';
    expect(escapeTextUnderscores(content)).toBe(expected);
  });
});
