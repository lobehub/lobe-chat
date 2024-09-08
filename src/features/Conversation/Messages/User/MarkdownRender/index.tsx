import { Flexbox } from 'react-layout-kit';

import { MarkdownCustomRender } from '../../../types';
import ContentPreview from './ContentPreview';

export const MarkdownRender: MarkdownCustomRender = ({ text, dom, id }) => {
  if (text.length > 30_000)
    return (
      <Flexbox>
        <ContentPreview content={text} id={id} />
      </Flexbox>
    );

  return dom;
};
