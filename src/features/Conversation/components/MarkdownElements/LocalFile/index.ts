import { FC } from 'react';

import { createRemarkSelfClosingTagPlugin } from '../remarkPlugins/createRemarkSelfClosingTagPlugin';
import { MarkdownElement, MarkdownElementProps } from '../type';
import RenderComponent from './Render';

// 定义此元素的标签名
const tag = 'localFile';

const LocalFileElement: MarkdownElement = {
  Component: RenderComponent as FC<MarkdownElementProps>,
  remarkPlugin: createRemarkSelfClosingTagPlugin(tag),
  tag,
};

export default LocalFileElement;
