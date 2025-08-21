export const content = `# This is an H1
## This is an H2
### This is an H3
#### This is an H4
##### This is an H5

The point of reference-style links is not that they’re easier to write. The point is that with reference-style links, your document source is vastly more readable. Compare the above examples: using reference-style links, the paragraph itself is only 81 characters long; with inline-style links, it’s 176 characters; and as raw \`HTML\`, it’s 234 characters. In the raw \`HTML\`, there’s more markup than there is text.

---

> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.
>
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> id sem consectetuer libero luctus adipiscing.

---

an example | *an example* | **an example**

~~这是删除线~~ (两个波浪线)

~这不会被渲染为删除线~ (单个波浪线)

---

![](https://github.com/user-attachments/assets/2428a136-38bf-488c-8033-d9f261d67f3d)

![](https://github.com/user-attachments/assets/625cf558-4c32-4489-970a-2723ebadbc23)

<video src="https://github.com/lobehub/lobe-chat/assets/28616219/f29475a3-f346-4196-a435-41a6373ab9e2"/>

---

1. Bird
1. McHale
1. Parish
    1. Bird
    1. McHale
        1. Parish

---

- Red
- Green
- Blue
    - Red
    - Green
        - Blue

---

This is [an example](http://example.com/ "Title") inline link.

<http://example.com/>


| title | title | title |
| --- | --- | --- |
| content | content | content |


\`\`\`bash
$ pnpm install
\`\`\`


\`\`\`javascript
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { useDropNodeOnCanvas } from './useDropNodeOnCanvas';
\`\`\`


\`\`\`mermaid
graph TD
A[Enter Chart Definition] --> B(Preview)
B --> C{decide}
C --> D[Keep]
C --> E[Edit Definition]
E --> B
D --> F[Save Image and Code]
F --> B
\`\`\`


---

以下是一段Markdown格式的LaTeX数学公式：

我是一个行内公式：$E=mc^2$

我是一个独立的傅里叶公式：
$$
f(x) = a_0 + \\sum_{n=1}^{\\infty} \\left( a_n \\cos(nx) + b_n \\sin(nx) \\right)
$$

其中，带有积分符号的项：
$$
a_0 = \\frac{1}{2\\pi} \\int_{-\\pi}^{\\pi} f(x) \\, dx
$$

$$
a_n = \\frac{1}{\\pi} \\int_{-\\pi}^{\\pi} f(x) \\cos(nx) \\, dx \\quad \\text{for} \\quad n \\geq 1
$$

$$
b_n = \\frac{1}{\\pi} \\int_{-\\pi}^{\\pi} f(x) \\sin(nx) \\, dx \\quad \\text{for} \\quad n \\geq 1
$$

我是一个带有分式、测试长度超长的泰勒公式：

$$
\\begin{equation}
f(x) = f(a) + f'(a)(x - a) + \\frac{f''(a)}{2!}(x - a)^2 + \\frac{f'''(a)}{3!}(x - a)^3 + \\cdots + \\frac{f^{(n)}(a)}{n!}(x - a)^n + R_n(x)
\\end{equation}
$$

我是上面公式的行内版本，看看我会不会折行：$ f(x) = f(a) + f'(a)(x - a) + \\frac{f''(a)}{2!}(x - a)^2 + \\frac{f'''(a)}{3!}(x - a)^3 + \\cdots + \\frac{f^{(n)}(a)}{n!}(x - a)^n + R_n(x) $


我是一个带有上下标的公式：
$$
q_1 q_2 = (w_1 w_2 - \\vec{v}_1^T \\vec{v}_2, \\, w_1 \\vec{v}_2 + w_2 \\vec{v}_1 + \\vec{v}_1 \\times \\vec{v}_2)
$$

我是一个带有 tag 的公式：
$$
q = a + bi + cj + dk \\tag{1}
$$

---

我是一个嵌套测试：
\`\`\`
$1
\`\`\`
`;

export const content2 = `# Customize Markdown Components
#### Customize Anchor Behavior
This is [an example](http://example.com/ "Title") inline link.

<http://example.com/>


#### Customize Hr

---

#### Customize Image Display

![](https://github.com/user-attachments/assets/2428a136-38bf-488c-8033-d9f261d67f3d)
`;

export const code = `

#### Notation Diff

\`\`\`ts
export function foo() {
  console.log('hewwo') // [!code --]
  console.log('hello') // [!code ++]
}
\`\`\`

#### Notation Highlight

\`\`\`ts
export function foo() {
  console.log('Highlighted') // [!code highlight]
}
\`\`\`

#### Notation WordHighlight

\`\`\`ts
export function foo() { // [!code word:Hello]
  const msg = 'Hello World'
  console.log(msg) // 打印 Hello World
}
\`\`\`

#### Notation Focus

\`\`\`ts
export function foo() {
  console.log('Focused') // [!code focus]
}
\`\`\`

#### Notation ErrorLevel

\`\`\`ts
export function foo() {
  console.error('Error') // [!code error]
  console.warn('Warning') // [!code warning]
}
\`\`\`
`;

export const fullContent = `
好的,让我来用新的视角解释一下"睡觉"这个词。

<antThinking>这个请求适合创建一个新的SVG卡片artifact。它是一个独立的视觉元素,可以重复使用或修改,符合好的artifact标准。我将创建一个新的artifact,标识符为"sleep-interpretation-card"。</antThinking>

<antArtifact identifier="sleep-interpretation-card" type="image/svg+xml" title="睡觉的新解释">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap');
    </style>
  </defs>

  <!-- 背景 -->
  <rect width="400" height="600" fill="#F0EAD6"/>

  <!-- 总结 -->
  <text x="200" y="500" font-family="'Noto Serif SC', serif" font-size="20" text-anchor="middle" fill="#8B4513">睡觉：生产力的假死，创造力的重生。</text>
</svg>
</antArtifact>

这是我为"睡觉"这个词创作的新解释卡片。


# AI Assistant Response

Hello! I'm an AI assistant. I can help you with various tasks like:

1. Answering questions
2. Providing information
3. Writing code examples
4. Explaining concepts

## Code Example

Here's a simple React component:

\`\`\`tsx
'use client';

import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

import { PreviewGroup } from '@/Image';
import { useMarkdown } from '@/hooks/useMarkdown';

import { SyntaxMarkdownProps } from '../type';

const SyntaxMarkdown = memo<SyntaxMarkdownProps>(
  ({
    children,
    fullFeaturedCodeBlock,
    animated,
    enableLatex = true,
    enableMermaid = true,
    enableImageGallery = true,
    enableCustomFootnotes,
    componentProps,
    allowHtml,
    showFootnotes,
    variant = 'default',
    reactMarkdownProps,
    rehypePlugins,
    remarkPlugins,
    remarkPluginsAhead,
    components = {},
    customRender,
    citations,
  }) => {
    // Use our new hook to handle Markdown processing
    const { escapedContent, memoComponents, rehypePluginsList, remarkPluginsList } = useMarkdown({
      allowHtml,
      animated,
      children,
      citations,
      componentProps,
      components,
      enableCustomFootnotes,
      enableImageGallery,
      enableLatex,
      enableMermaid,
      fullFeaturedCodeBlock,
      rehypePlugins,
      remarkPlugins,
      remarkPluginsAhead,
      showFootnotes,
      variant,
    });

    // 渲染默认内容
    const defaultDOM = useMemo(
      () => (
        <PreviewGroup enable={enableImageGallery}>
          <ReactMarkdown
            {...reactMarkdownProps}
            components={memoComponents}
            rehypePlugins={rehypePluginsList}
            remarkPlugins={remarkPluginsList}
          >
            {escapedContent}
          </ReactMarkdown>
        </PreviewGroup>
      ),
      [
        escapedContent,
        memoComponents,
        rehypePluginsList,
        remarkPluginsList,
        enableImageGallery,
        reactMarkdownProps,
      ],
    );

    // 应用自定义渲染
    const markdownContent = customRender
      ? customRender(defaultDOM, { text: escapedContent || '' })
      : defaultDOM;

    return markdownContent;
  },
);

SyntaxMarkdown.displayName = 'SyntaxMarkdown';

export default SyntaxMarkdown;
\`\`\`

## Math Support

I can also render mathematical formulas:

$$
f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi) e^{2\\pi i \\xi x} d\\xi
$$

## Data Visualization

\`\`\`mermaid
graph TD
  A[User Input] --> B[AI Processing]
  B --> C[Response Generation]
  C --> D[Content Display]
\`\`\`

Thank you for your attention!
`;

export const github = `

## Github Alerts

> [!NOTE]
> Highlights information that users should take into account, even when skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Crucial information necessary for users to succeed.

> [!WARNING]
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action.

## Github Tasks

- [ ] Task 1: Implement feature X
- [x] Task 2: Fix bug Y


## Github Footnotes

Here is a simple footnote[^1].

A footnote can also have multiple lines[^2].

[^1]: My reference.
[^2]: To add line breaks within a footnote, prefix new lines with 2 spaces.
  This is a second line.
`;
