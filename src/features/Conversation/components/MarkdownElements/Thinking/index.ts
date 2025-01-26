import createOneLineRehypePlugin from '../rehypePlugin/createOneLineRehypePlugin';
import Component from './Render';

const ThinkingElement = {
  Component,
  rehypePlugin: createOneLineRehypePlugin('think'),
  tag: 'think',
};

export default ThinkingElement;
