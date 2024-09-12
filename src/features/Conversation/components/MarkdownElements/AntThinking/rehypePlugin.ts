import type { Node } from 'unist';
import { visit } from 'unist-util-visit';

// eslint-disable-next-line unicorn/consistent-function-scoping
const rehypePlugin = () => (tree: Node) => {
  visit(tree, 'element', (node: any, index, parent) => {
    if (node.type === 'element' && node.tagName === 'p') {
      const children = node.children || [];
      const openTagIndex = children.findIndex(
        (child: any) => child.type === 'raw' && child.value === '<antThinking>',
      );
      const closeTagIndex = children.findIndex(
        (child: any) => child.type === 'raw' && child.value === '</antThinking>',
      );

      if (openTagIndex !== -1 && closeTagIndex !== -1 && closeTagIndex > openTagIndex) {
        const content = children.slice(openTagIndex + 1, closeTagIndex);
        const antThinkingNode = {
          children: content,
          properties: {},
          tagName: 'antThinking',
          type: 'element',
        };

        // Replace the entire paragraph with our new antThinking node
        parent.children.splice(index, 1, antThinkingNode);
        return index; // Skip processing the newly inserted node
      }
    }
  });
};

export default rehypePlugin;
