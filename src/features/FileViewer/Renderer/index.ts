import ImageRenderer from './Image';
import JavaScriptRenderer from './JavaScript';
import MSDocRenderer from './MSDoc';
import MarkdownRenderer from './Markdown';
import TXTRenderer from './TXT';
import VideoRenderer from './Video';

export const FileViewRenderers = [
  TXTRenderer,
  MarkdownRenderer,
  JavaScriptRenderer,
  ImageRenderer,
  MSDocRenderer,
  VideoRenderer,
];
