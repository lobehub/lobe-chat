import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo } from 'react';

import { useEntityDemoStore } from '../store';

const styles = stylex.create({
  link: {
    backgroundColor: 'transparent',
    borderStyle: 'none',
    color: {
      default: cssVar.colorTextSecondary,
      ':hover': cssVar.colorText,
    },
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    paddingBlock: 0,
    paddingInline: 0,
    textDecorationColor: cssVar.colorBorder,
    textDecorationLine: 'underline',
    textUnderlineOffset: '3px',
  },
});

interface EntityLinkProps {
  id: string;
}

/** An inline name that opens its page. Stored as an id, so a rename never breaks it. */
const EntityLink = memo<EntityLinkProps>(({ id }) => {
  const entity = useEntityDemoStore((s) => s.entities.find((e) => e.id === id));
  const open = useEntityDemoStore((s) => s.open);
  if (!entity) return null;

  return (
    <button type={'button'} {...stylex.props(styles.link)} onClick={() => open(id)}>
      {entity.title}
    </button>
  );
});

EntityLink.displayName = 'EntityLink';

export default EntityLink;
