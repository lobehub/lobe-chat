import { MENTION_TAG } from '@/const/plugin';

import { MarkdownElement } from '@/features/Conversation/MarkdownElements/type';
import Component from './Render';
import { createRemarkCustomTagWithAttributesPlugin } from '@/features/Conversation/MarkdownElements/remarkPlugins/createRemarkCustomTagWithAttributesPlugin';

const Mention: MarkdownElement = {
  Component,
  remarkPlugin: createRemarkCustomTagWithAttributesPlugin(MENTION_TAG),
  scope: 'all',
  tag: MENTION_TAG,
};

export default Mention;
