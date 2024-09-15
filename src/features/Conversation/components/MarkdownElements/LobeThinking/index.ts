import { ARTIFACT_THINKING_TAG } from '@/const/plugin';

import Component from './Render';
import rehypePlugin from './rehypePlugin';

const AntThinkingElement = {
  Component,
  rehypePlugin,
  tag: ARTIFACT_THINKING_TAG,
};

export default AntThinkingElement;
