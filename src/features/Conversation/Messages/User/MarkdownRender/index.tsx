import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import { MarkdownCustomRender } from '../../../types';
import ContentPreview from './ContentPreview';

export const MarkdownRender: MarkdownCustomRender = ({ text, dom, id, displayMode }) => {
  const disableMarkdownRender = useUserStore(
    (s) => settingsSelectors.currentSettings(s).general.disableMarkdownRender,
  );

  if (disableMarkdownRender) {
    return <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>;
  }

  if (text.length > 30_000)
    return (
      <Flexbox>
        <ContentPreview content={text} displayMode={displayMode} id={id} />
      </Flexbox>
    );

  return dom;
};
