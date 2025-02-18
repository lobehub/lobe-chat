import { ARTIFACT_THINKING_TAG } from '@/const/plugin';

import { MarkdownElement } from '../type';
import Component from './Render';
import rehypePlugin from './rehypePlugin';

const LobeThinkingElement: MarkdownElement = {
  Component,
  rehypePlugin,
  tag: ARTIFACT_THINKING_TAG,
};

export default LobeThinkingElement;
