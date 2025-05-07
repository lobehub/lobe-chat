import { createRemarkCustomTagPlugin } from '../remarkPlugins/createRemarkCustomTagPlugin';
import { MarkdownElement } from '../type';
import Component from './Render';

const ThoughtElement: MarkdownElement = {
  Component,
  remarkPlugin: createRemarkCustomTagPlugin('thought'),
  tag: 'thought',
};

export default ThoughtElement;
