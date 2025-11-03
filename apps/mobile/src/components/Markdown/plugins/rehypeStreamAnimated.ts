/**
 * Rehype plugin to add animation classes for streaming text
 * Wraps text nodes in span elements with animation classes
 *
 * This plugin processes text content in specific elements (p, h1-h6, li, strong)
 * and splits them into individual words/characters for streaming animation effect
 */
import type { Element, ElementContent, Root } from 'hast';
import { visit } from 'unist-util-visit';
import type { BuildVisitor } from 'unist-util-visit';

/**
 * Segments text into words or characters with smart splitting
 * Optimized for mixed Chinese/English text and better animation experience
 *
 * Rules:
 * - English words stay together (better visual flow)
 * - Numbers stay together
 * - Chinese characters split individually (natural for CJK)
 * - Punctuation and spaces preserved
 */
const segmentText = (text: string): string[] => {
  // Regex pattern:
  // - \d+\.?\d* : Numbers (including decimals like 3.14)
  // - [a-zA-Z]+(?:'[a-zA-Z]+)? : English words (including contractions like don't)
  // - [\u4e00-\u9fa5] : Chinese characters (CJK Unified Ideographs)
  // - [^\s] : Other characters (punctuation, symbols, etc.)
  // - \s+ : Whitespace
  const pattern = /\d+\.?\d*|[A-Za-z]+(?:'[A-Za-z]+)?|[\u4E00-\u9FA5]|\S|\s+/g;

  const matches = text.match(pattern);
  if (matches) {
    return matches;
  }

  // Fallback to character split if regex fails
  return text.split('');
};

export const rehypeStreamAnimated = () => {
  return (tree: Root) => {
    visit(tree, 'element', ((node: Element) => {
      if (
        ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'strong'].includes(node.tagName) &&
        node.children
      ) {
        const newChildren: Array<ElementContent> = [];
        for (const child of node.children) {
          if (child.type === 'text') {
            // Segment text into words or characters
            const segments = segmentText(child.value);
            segments.forEach((segment: string) => {
              newChildren.push({
                children: [{ type: 'text', value: segment }],
                properties: {
                  className: 'animate-fade-in',
                },
                tagName: 'span',
                type: 'element',
              });
            });
          } else {
            newChildren.push(child);
          }
        }
        node.children = newChildren;
      }
    }) as BuildVisitor<Root, 'element'>);
  };
};
