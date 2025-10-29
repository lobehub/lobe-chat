import { memo } from 'react';
import { View } from 'react-native';

import TextWrapper from '../ReactNativeMarkdown/components/TextWrapper';
import Footnotes from './Footnotes';
import { useMarkdownContext } from './MarkdownProvider';

interface SectionProps {
  'children': any;
  'data-footnotes'?: boolean;
}

const Section = memo<SectionProps>(({ children, ...rest }) => {
  const { showFootnotes, enableCustomFootnotes } = useMarkdownContext();

  if (enableCustomFootnotes && rest['data-footnotes']) {
    if (!showFootnotes) return null;
    return <Footnotes {...rest}>{children}</Footnotes>;
  }

  return (
    <View>
      <TextWrapper>{children}</TextWrapper>
    </View>
  );
});

export default Section;
