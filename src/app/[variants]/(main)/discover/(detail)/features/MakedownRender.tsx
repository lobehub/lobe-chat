import { Markdown } from '@lobehub/ui';
import { Empty } from 'antd';
import Link from 'next/link';
import { ReactNode, memo } from 'react';
import { Center } from 'react-layout-kit';

import { H1, H2, H3, H4, H5 } from './Toc/Heading';

const MarkdownRender = memo<{ children?: string }>(({ children }) => {
  if (!children)
    return (
      <Center paddingBlock={32} width={'100%'}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Center>
    );

  return (
    <Markdown
      allowHtml
      components={{
        a: ({ href, ...rest }: { children: ReactNode; href: string }) => {
          if (href && href.startsWith('http'))
            return <Link {...rest} href={href} target={'_blank'} />;
          return rest?.children;
        },
        h1: H1,
        h2: H2,
        h3: H3,
        h4: H4,
        h5: H5,
        img: ({ src, ...rest }: { src: string }) => {
          if (src.includes('glama.ai')) return;

          // eslint-disable-next-line @next/next/no-img-element
          if (src && src.startsWith('http')) return <img src={src} {...rest} />;
          return;
        },
      }}
      enableImageGallery={false}
      enableLatex={false}
    >
      {children}
    </Markdown>
  );
});

export default MarkdownRender;
