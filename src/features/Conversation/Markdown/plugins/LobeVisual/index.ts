import { type FC } from 'react';

import { VISUAL_TAG } from '@/const/plugin';

import { type MarkdownElement, type MarkdownElementProps } from '../type';
import { remarkVisual } from './remarkPlugin';
import Render from './Render';

const LobeVisualElement: MarkdownElement = {
  Component: Render as FC<MarkdownElementProps>,
  remarkPlugin: remarkVisual,
  scope: 'assistant',
  tag: VISUAL_TAG,
};

export default LobeVisualElement;
