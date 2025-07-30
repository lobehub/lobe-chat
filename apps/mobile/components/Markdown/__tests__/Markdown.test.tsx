import React from 'react';
import { useWindowDimensions } from 'react-native';
import { renderWithTheme } from '@/mobile/test/utils';
import MarkdownRender from '../index';

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  useWindowDimensions: jest.fn(),
  Platform: { OS: 'ios' },
}));

jest.mock('react-native-markdown-display', () => {
  const MockMarkdown = ({ children }: { children: string }) => (
    <div data-testid="markdown-content">{children}</div>
  );
  return MockMarkdown;
});

jest.mock('react-native-mathjax-html-to-svg', () => ({
  MathJaxSvg: ({ children }: { children: string }) => (
    <div data-testid="mathjax-svg">{children}</div>
  ),
}));

jest.mock('@/mobile/components/Highlighter', () => {
  const MockHighlighter = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="highlighter">{children}</div>
  );
  return MockHighlighter;
});

jest.mock('@/mobile/theme', () => ({
  useThemeToken: () => ({
    colorText: '#000000',
    colorTextSecondary: '#666666',
    colorBgLayout: '#f5f5f5',
    colorPrimary: '#1677ff',
    fontSize: 16,
    borderRadius: 6,
    borderRadiusSM: 4,
    padding: 16,
    paddingSM: 12,
    paddingXS: 8,
  }),
}));

describe('MarkdownRender', () => {
  beforeEach(() => {
    (useWindowDimensions as jest.Mock).mockReturnValue({
      width: 375,
      height: 812,
    });
  });

  it('renders correctly with basic content', () => {
    const { getByTestId } = renderWithTheme(<MarkdownRender content="# Hello World" />);

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('renders with custom fontSize', () => {
    const { getByTestId } = renderWithTheme(
      <MarkdownRender content="# Hello World" fontSize={20} />,
    );

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('renders with custom headerMultiple', () => {
    const { getByTestId } = renderWithTheme(
      <MarkdownRender content="# Hello World" headerMultiple={1.5} />,
    );

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('renders with custom lineHeight', () => {
    const { getByTestId } = renderWithTheme(
      <MarkdownRender content="# Hello World" lineHeight={2.0} />,
    );

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('renders with custom marginMultiple', () => {
    const { getByTestId } = renderWithTheme(
      <MarkdownRender content="# Hello World" marginMultiple={2.0} />,
    );

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('renders with empty content', () => {
    const { getByTestId } = renderWithTheme(<MarkdownRender content="" />);

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('renders with code blocks', () => {
    const codeContent = "```javascript\nconst hello = 'world';\n```";
    const { getByTestId } = renderWithTheme(<MarkdownRender content={codeContent} />);

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('renders with blockquotes', () => {
    const blockquoteContent = '> This is a blockquote';
    const { getByTestId } = renderWithTheme(<MarkdownRender content={blockquoteContent} />);

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('renders with lists', () => {
    const listContent = '- Item 1\n- Item 2\n- Item 3';
    const { getByTestId } = renderWithTheme(<MarkdownRender content={listContent} />);

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('renders with links', () => {
    const linkContent = '[Link text](https://example.com)';
    const { getByTestId } = renderWithTheme(<MarkdownRender content={linkContent} />);

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('renders with images', () => {
    const imageContent = '![Alt text](https://example.com/image.png)';
    const { getByTestId } = renderWithTheme(<MarkdownRender content={imageContent} />);

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('renders with tables', () => {
    const tableContent =
      '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
    const { getByTestId } = renderWithTheme(<MarkdownRender content={tableContent} />);

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('renders with math expressions', () => {
    const mathContent = 'Inline math: $x^2 + y^2 = z^2$';
    const { getByTestId } = renderWithTheme(<MarkdownRender content={mathContent} />);

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('renders with block math', () => {
    const mathContent = '$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$';
    const { getByTestId } = renderWithTheme(<MarkdownRender content={mathContent} />);

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('handles different window dimensions', () => {
    (useWindowDimensions as jest.Mock).mockReturnValue({
      width: 768,
      height: 1024,
    });

    const { getByTestId } = renderWithTheme(<MarkdownRender content="# Hello World" />);

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('renders with all custom props', () => {
    const { getByTestId } = renderWithTheme(
      <MarkdownRender
        content="# Hello World"
        fontSize={18}
        headerMultiple={1.2}
        lineHeight={1.6}
        marginMultiple={1.8}
      />,
    );

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('renders with complex markdown content', () => {
    const complexContent = `
# Main Title

## Subtitle

This is a paragraph with **bold** and *italic* text.

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

> This is a blockquote

- List item 1
- List item 2
  - Nested item

[Link](https://example.com)

![Image](https://example.com/image.png)
`;

    const { getByTestId } = renderWithTheme(<MarkdownRender content={complexContent} />);

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('handles malformed markdown gracefully', () => {
    const malformedContent = '# Incomplete header\n\n```\nUnclosed code block\n\n[Broken link](';
    const { getByTestId } = renderWithTheme(<MarkdownRender content={malformedContent} />);

    expect(getByTestId('markdown-content')).toBeTruthy();
  });
});
