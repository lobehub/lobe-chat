import { MarkdownElement } from '../type';
import Component from './Render';
import { createRemarkCustomTagPlugin } from './remarkPlugin';

const ThinkingElement: MarkdownElement = {
  Component,
  remarkPlugin: createRemarkCustomTagPlugin('think'),
  tag: 'think',
};

export default ThinkingElement;
