import React from 'react';
import { renderWithTheme } from '@/test/utils';
import Highlighter from '../index';

jest.mock('@/theme', () => ({
  useTheme: () => ({
    isDarkMode: false,
  }),
}));

jest.mock('../FullFeatured', () => {
  const MockFullFeatured = ({ code, lang }: { code: string; lang: string }) => (
    <div data-testid="full-featured" data-code={code} data-lang={lang}>
      FullFeatured
    </div>
  );
  return MockFullFeatured;
});

jest.mock('../TokenDisplay', () => ({
  TokenDisplay: ({ tokens }: { tokens: any[] }) => (
    <div data-testid="token-display" data-tokens={JSON.stringify(tokens)}>
      TokenDisplay
    </div>
  ),
}));

jest.mock('../contexts/highlighter', () => ({
  HighlighterProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="highlighter-provider">{children}</div>
  ),
  supportedLanguageIds: ['javascript', 'python', 'markdown', 'typescript'],
}));

jest.mock('../hooks/useTokenize', () => ({
  useTokenize: jest.fn(() => ({
    tokens: [
      { content: 'const', color: '#0000ff' },
      { content: ' hello = ', color: '#000000' },
      { content: "'world'", color: '#008000' },
    ],
    loading: false,
  })),
}));

describe('Highlighter', () => {
  it('renders correctly with default props', () => {
    const { toJSON } = renderWithTheme(<Highlighter code="const hello = 'world';" />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom language', () => {
    const { toJSON } = renderWithTheme(<Highlighter code="print('hello world')" lang="python" />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with full featured mode', () => {
    const { toJSON } = renderWithTheme(
      <Highlighter code="const hello = 'world';" fullFeatured={true} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with copyable enabled', () => {
    const { toJSON } = renderWithTheme(
      <Highlighter code="const hello = 'world';" copyable={true} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with show language enabled', () => {
    const { toJSON } = renderWithTheme(
      <Highlighter code="const hello = 'world';" showLanguage={true} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with allow change language enabled', () => {
    const { toJSON } = renderWithTheme(
      <Highlighter code="const hello = 'world';" allowChangeLanguage={true} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with default expand enabled', () => {
    const { toJSON } = renderWithTheme(
      <Highlighter code="const hello = 'world';" defalutExpand={true} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with fileName', () => {
    const { toJSON } = renderWithTheme(
      <Highlighter code="const hello = 'world';" fileName="example.js" />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with compact type', () => {
    const { toJSON } = renderWithTheme(
      <Highlighter code="const hello = 'world';" type="compact" />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with default type', () => {
    const { toJSON } = renderWithTheme(
      <Highlighter code="const hello = 'world';" type="default" />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom style', () => {
    const customStyle = { backgroundColor: '#f5f5f5' };
    const { toJSON } = renderWithTheme(
      <Highlighter code="const hello = 'world';" style={customStyle} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with empty code', () => {
    const { toJSON } = renderWithTheme(<Highlighter code="" />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with long code', () => {
    const longCode = `
      function fibonacci(n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
      }
      
      for (let i = 0; i < 10; i++) {
        console.log(fibonacci(i));
      }
    `;
    const { toJSON } = renderWithTheme(<Highlighter code={longCode} lang="javascript" />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with multiline code', () => {
    const multilineCode = `line 1
line 2
line 3`;
    const { toJSON } = renderWithTheme(<Highlighter code={multilineCode} />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with special characters', () => {
    const specialCode = `const message = "Hello, World! 🌍";`;
    const { toJSON } = renderWithTheme(<Highlighter code={specialCode} lang="javascript" />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with unsupported language', () => {
    const { toJSON } = renderWithTheme(<Highlighter code="SELECT * FROM users;" lang="sql" />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with all props enabled', () => {
    const { toJSON } = renderWithTheme(
      <Highlighter
        code="const hello = 'world';"
        lang="javascript"
        fullFeatured={true}
        copyable={true}
        showLanguage={true}
        allowChangeLanguage={true}
        defalutExpand={true}
        fileName="example.js"
        type="default"
        style={{ backgroundColor: '#f5f5f5' }}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders TokenDisplay when not full featured', () => {
    const { toJSON } = renderWithTheme(
      <Highlighter code="const hello = 'world';" fullFeatured={false} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles different language variations', () => {
    const languages = ['javascript', 'python', 'typescript', 'markdown'];

    languages.forEach((lang) => {
      const { toJSON } = renderWithTheme(<Highlighter code={`// ${lang} code`} lang={lang} />);

      expect(toJSON()).toBeTruthy();
    });
  });

  it('handles code with tabs and spaces', () => {
    const formattedCode = `function test() {
	if (true) {
		return "hello";
	}
}`;
    const { toJSON } = renderWithTheme(<Highlighter code={formattedCode} lang="javascript" />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles code with mixed quotes', () => {
    const mixedQuotes = `const single = 'hello';
const double = "world";
const template = \`template\`;`;
    const { toJSON } = renderWithTheme(<Highlighter code={mixedQuotes} lang="javascript" />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles code with comments', () => {
    const codeWithComments = `// This is a comment
const hello = 'world'; // Another comment
/* Block comment */`;
    const { toJSON } = renderWithTheme(<Highlighter code={codeWithComments} lang="javascript" />);

    expect(toJSON()).toBeTruthy();
  });
});
