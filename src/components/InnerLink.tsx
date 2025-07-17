'use client';

import Link, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes, ReactNode } from 'react';
import urlJoin from 'url-join';

import { useServerConfigStore } from '@/store/serverConfig';

interface InnerLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
    LinkProps {
  children?: ReactNode | undefined;
}

const InnerLink = ({ href, ...props }: InnerLinkProps) => {
  const variants = useServerConfigStore((s) => s.segmentVariants);

  // Fallback for non-string hrefs or cases where we can't process the href
  if (typeof href !== 'string') {
    return <Link {...props} href={href} />;
  }

  const [pathname] = href.split('?');

  const finalHref = {
    pathname: variants ? urlJoin('/', variants, pathname) : pathname,
  };

  return <Link {...props} as={href} href={finalHref} />;
};

export default InnerLink;
