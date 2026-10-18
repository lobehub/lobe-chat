import { visit } from 'unist-util-visit';

import { VISUAL_CODE_LANG, VISUAL_TAG } from '@/const/plugin';

/**
 * Turn a fenced `visual` code block into a `lobeVisual` element whose only child
 * is the raw fence body, so the visual renderer replaces the code highlighter.
 */
export const remarkVisual = () => (tree: any) => {
  visit(tree, 'code', (node: any, index, parent: any) => {
    if (node.lang !== VISUAL_CODE_LANG || !parent || index === undefined) return;

    parent.children.splice(index, 1, {
      data: {
        hChildren: [{ type: 'text', value: node.value ?? '' }],
        hName: VISUAL_TAG,
        hProperties: {},
      },
      type: VISUAL_TAG,
    });
  });
};
