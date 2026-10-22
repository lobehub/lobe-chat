'use client';

import { RENDERER_HANDLED_LINK_ATTR } from '@lobechat/desktop-bridge';
import { A } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import type { MouseEvent } from 'react';
import { memo, useCallback } from 'react';

import FileIcon from '@/components/FileIcon';
import { useChatStore } from '@/store/chat';

import { useConversationStore } from '../../../store';
import type { MarkdownElementProps } from '../type';
import { getFileLinkOpenAction } from './parse';

interface FileLinkProperties {
  fileId?: string;
  linkHref?: string;
  linkLabel?: string;
}

const styles = stylex.create({
  icon: { display: 'inline-flex', flexShrink: 0, alignItems: 'center' },
  link: {
    cursor: 'pointer',
    display: 'inline-flex',
    gap: '4px',
    alignItems: 'center',
    marginInline: '-2px',
    paddingInline: '2px',
    borderRadius: cssVar.borderRadiusSM,
    textDecoration: { 'default': 'none', ':hover': 'underline' },
    verticalAlign: '-0.16em',
    transition: `color 0.2s ${cssVar.motionEaseOut},
      background 0.2s ${cssVar.motionEaseOut},
      box-shadow 0.2s ${cssVar.motionEaseOut}`,
    color: { 'default': null, ':hover': cssVar.colorLinkHover, ':active': cssVar.colorLinkActive },
    textUnderlineOffset: { 'default': null, ':hover': '2px' },
    backgroundColor: {
      'default': null,
      ':hover': cssVar.colorFillSecondary,
      ':active': cssVar.colorFill,
    },
    backgroundImage: { 'default': null, ':hover': 'none', ':active': 'none' },
    boxShadow: { 'default': null, ':hover': `inset 0 0 0 1px ${cssVar.colorPrimaryBorder}` },
    outlineWidth: { 'default': null, ':focus-visible': '2px' },
    outlineStyle: { 'default': null, ':focus-visible': 'solid' },
    outlineColor: { 'default': null, ':focus-visible': cssVar.colorPrimaryBorder },
    outlineOffset: { 'default': null, ':focus-visible': '2px' },
  },
});

const Render = memo<MarkdownElementProps<FileLinkProperties>>(({ node }) => {
  const { fileId, linkHref, linkLabel } = node?.properties || {};
  const openFilePreview = useChatStore((s) => s.openFilePreview);
  const isAgentShareVisitor = useConversationStore((s) => !!s.context.agentShareId);
  const label = linkLabel || linkHref || '';

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!fileId) return;
      if (event.button !== 0) return;

      // Modifier/middle click keeps the native "open in a new tab" behavior.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      const action = getFileLinkOpenAction({ fileId, isAgentShareVisitor, label, linkHref });
      if (action.kind === 'newTab') {
        window.open(action.url, '_blank', 'noopener,noreferrer');
        return;
      }
      openFilePreview(action.params);
    },
    [fileId, isAgentShareVisitor, label, linkHref, openFilePreview],
  );

  return (
    <A
      {...(fileId ? { [RENDERER_HANDLED_LINK_ATTR]: 'true' } : {})}
      className={stylex.props(styles.link).className}
      href={linkHref}
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      <span aria-hidden {...stylex.props(styles.icon)}>
        <FileIcon fileName={label} size={16} variant={'raw'} />
      </span>
      <span>{label}</span>
    </A>
  );
});

Render.displayName = 'FileLinkRender';

export default Render;
