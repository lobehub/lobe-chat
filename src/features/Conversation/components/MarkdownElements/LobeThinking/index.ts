import { ARTIFACT_THINKING_TAG } from '@/const/plugin';

import Component from './Render';
import rehypePlugin from './rehypePlugin';

const LobeThinkingElement = {
  Component,
  rehypePlugin,
  tag: ARTIFACT_THINKING_TAG,
};

export default LobeThinkingElement;
