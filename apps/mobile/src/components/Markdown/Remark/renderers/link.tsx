import { Link, LinkReference } from 'mdast';
import { ReactNode, useCallback } from 'react';
import { Text } from 'react-native';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const LinkReferenceRenderer = ({ node }: RendererArgs<LinkReference>): ReactNode => {
  const { renderers, definitions, styles, onLinkPress } = useMarkdownContext();
  const { PhrasingContentRenderer } = renderers;
  const url = definitions[node.identifier]?.url;

  const onPress = useCallback(() => {
    if (url) {
      onLinkPress?.(url);
    }
  }, [url, onLinkPress]);

  return (
    <Text onPress={onLinkPress ? onPress : undefined} style={styles.linkReference}>
      {node.children.map((child, index) => (
        <PhrasingContentRenderer index={index} key={index} node={child} parent={node} />
      ))}
    </Text>
  );
};

export const LinkRenderer = ({ node }: RendererArgs<Link>): ReactNode => {
  const { renderers, styles, onLinkPress } = useMarkdownContext();
  const { PhrasingContentRenderer } = renderers;
  const { url } = node;

  const onPress = useCallback(() => {
    if (url) {
      onLinkPress?.(url);
    }
  }, [url, onLinkPress]);

  return (
    <Text onPress={onLinkPress ? onPress : undefined} style={styles.link}>
      {node.children.map((child, index) => (
        <PhrasingContentRenderer index={index} key={index} node={child} parent={node} />
      ))}
    </Text>
  );
};
