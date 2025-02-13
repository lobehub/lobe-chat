import { FC } from 'react';

import { MarkdownElement, MarkdownElementProps } from '../type';
import Component from './Render';
import rehypePlugin from './rehypePlugin';

const AntArtifactElement: MarkdownElement = {
  Component: Component as unknown as FC<MarkdownElementProps>,
  rehypePlugin,
  tag: 'lobeArtifact',
};

export default AntArtifactElement;
