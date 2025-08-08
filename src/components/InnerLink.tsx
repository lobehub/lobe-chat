'use client';

import Link, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes, ReactNode } from 'react';

import { useServerConfigStore } from '@/store/serverConfig';

interface InnerLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
    LinkProps {
  children?: ReactNode | undefined;
}

const InnerLink = ({ href, ...props }: InnerLinkProps) => {
  const variants = useServerConfigStore((s) => s.segmentVariants);

  return <Link {...props} as={href} href={`/${variants}${href}`} />;
};

export default InnerLink;
