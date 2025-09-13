import { MENTION_TAG } from '@/const/plugin';

import { createRemarkCustomTagWithAttributesPlugin } from '../remarkPlugins/createRemarkCustomTagWithAttributesPlugin';
import { MarkdownElement } from '../type';
import Component from './Render';

const Mention: MarkdownElement = {
  Component,
  remarkPlugin: createRemarkCustomTagWithAttributesPlugin(MENTION_TAG),
  scope: 'all',
  tag: MENTION_TAG,
};

export default Mention;
