import type { Node } from 'unist';
import { visit } from 'unist-util-visit';

import { ARTIFACT_THINKING_TAG } from '@/const/plugin';

// eslint-disable-next-line unicorn/consistent-function-scoping
const rehypePlugin = () => (tree: Node) => {
  visit(tree, 'element', (node: any, index, parent) => {
    if (node.type === 'element' && node.tagName === 'p') {
      const children = node.children || [];
      const openTagIndex = children.findIndex(
        (child: any) => child.type === 'raw' && child.value === `<${ARTIFACT_THINKING_TAG}>`,
      );
      const closeTagIndex = children.findIndex(
        (child: any) => child.type === 'raw' && child.value === `</${ARTIFACT_THINKING_TAG}>`,
      );

      if (openTagIndex !== -1) {
        // 有闭合标签的情况
        if (closeTagIndex !== -1 && closeTagIndex > openTagIndex) {
          const content = children.slice(openTagIndex + 1, closeTagIndex);
          const lobeThinkingNode = {
            children: content,
            properties: {},
            tagName: ARTIFACT_THINKING_TAG,
            type: 'element',
          };

          // Replace the entire paragraph with our new lobeThinking node
          parent.children.splice(index, 1, lobeThinkingNode);
          return index; // Skip processing the newly inserted node
        } else {
          // 无闭合标签的情况
          const content = children.slice(openTagIndex + 1);
          const lobeThinkingNode = {
            children: content,
            properties: {},
            tagName: ARTIFACT_THINKING_TAG,
            type: 'element',
          };

          // Replace the entire paragraph with our new lobeThinking node
          parent.children.splice(index, 1, lobeThinkingNode);
          return index; // Skip processing the newly inserted node
        }
      }
    }
  });
};

export default rehypePlugin;
