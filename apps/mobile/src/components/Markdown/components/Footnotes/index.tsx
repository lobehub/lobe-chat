import { A } from '@expo/html-elements';
import { type ReactNode, memo, useMemo } from 'react';
import { View } from 'react-native';

import Block from '@/components/Block';
import Flexbox from '@/components/Flexbox';
import Text from '@/components/Text';

import SearchResultCards from './SearchResultCards';

interface FootnotesProps {
  'children': ReactNode;
  'data-footnote-links'?: string;
  'data-footnotes'?: boolean;
}

const DefaultFootnotes = memo<{ dataSource: any[] }>(({ dataSource }) => {
  const items = useMemo(
    () =>
      dataSource
        .find((child) => child?.type === 'ol')
        ?.props?.children?.map((item: any) => {
          if (typeof item === 'string' || item?.type !== 'li') return false;
          const data = item?.props?.children?.find((note: any) => note?.props?.children)?.props
            ?.children;
          if (!data || !Array.isArray(data)) return false;
          return {
            children: data[0],
            props: data[1]?.props || {},
          };
        })
        .filter(Boolean),
    [dataSource],
  );

  if (!Array.isArray(items)) return null;

  return (
    <Flexbox
      align={'flex-start'}
      className={'footnotes'}
      data-footnotes="true"
      gap={'0.5em'}
      horizontal
      justify={'flex-start'}
      wrap={'wrap'}
    >
      {items.map(({ children, props }, index) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { node, href, ...rest } = props;
        const Container = href ? A : 'div';
        return (
          <Container {...(href ? { href, ...rest } : rest)} key={index}>
            <Block
              align={'stretch'}
              horizontal
              style={{ overflow: 'hidden', position: 'relative' }}
              variant={'outlined'}
            >
              <Block paddingInline={8} style={{ borderRadius: 0 }} variant={'filled'}>
                <Text code type={'secondary'}>
                  {index + 1}
                </Text>
              </Block>
              <Text style={{ paddingInline: 8 }} type={'secondary'}>
                {children}
              </Text>
            </Block>
          </Container>
        );
      })}
    </Flexbox>
  );
});

const Footnotes = memo<FootnotesProps>(({ children, ...rest }) => {
  const links = useMemo(() => {
    try {
      return JSON.parse(rest['data-footnote-links'] || '[]');
    } catch (error) {
      console.error('Failed to parse footnote links:', error);
      return [];
    }
  }, [rest['data-footnote-links']]);

  const isError = links.length === 0;

  if (!children) return;

  if (isError) {
    if (!Array.isArray(children)) return children;
    return <DefaultFootnotes dataSource={children} />;
  }

  return (
    <View style={{ marginTop: 8 }}>
      <SearchResultCards dataSource={links} />
    </View>
  );
});

Footnotes.displayName = 'Footnotes';

export default Footnotes;
