import { MarkdownCustomRender } from '../../types';

export const MarkdownRender: MarkdownCustomRender = (dom, { text }) => {
  if (text.length > 30_000) return <div>123</div>;

  return dom;
};
