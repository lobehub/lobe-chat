'use client';

import { Button, Flexbox, Popover, Text } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { ImageIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LibraryStatusIcon from '@/components/LibIcon/StatusIcon';
import LibraryCover, { libraryCoverOf } from '@/features/LibraryCover';
import CoverPicker from '@/features/LibraryCover/CoverPicker';
import { usePermission } from '@/hooks/usePermission';
import { useKnowledgeBaseStore } from '@/store/library';
import type { KnowledgeBaseItem } from '@/types/knowledgeBase';

const styles = stylex.create({
  changeCover: {
    position: 'absolute',
    insetBlockEnd: '12px',
    insetInlineEnd: '16px',
  },
  description: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    maxWidth: '720px',
    fontSize: '13px',
    lineHeight: '20px',
    color: cssVar.colorTextSecondary,
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 600,
    color: cssVar.colorText,
  },
});

interface LibraryHeroProps {
  library: KnowledgeBaseItem;
}

/**
 * The top of a library's root view: its cover, name and description, so the
 * library reads as a curated space rather than a bare folder listing.
 */
const LibraryHero = memo<LibraryHeroProps>(({ library }) => {
  const { t } = useTranslation('file');
  const { allowed: canEdit } = usePermission('edit_own_content');
  const updateKnowledgeBaseCover = useKnowledgeBaseStore((s) => s.updateKnowledgeBaseCover);
  const [open, setOpen] = useState(false);
  const cover = libraryCoverOf(library.settings);

  return (
    <Flexbox flex={'none'}>
      <LibraryCover cover={cover} height={112} seed={library.id}>
        {canEdit && (
          <Popover
            open={open}
            placement={'bottomRight'}
            trigger={'click'}
            content={
              <div style={{ width: 300 }}>
                <CoverPicker
                  seed={library.id}
                  value={cover}
                  onChange={(next) => {
                    void updateKnowledgeBaseCover(library.id, next);
                  }}
                />
              </div>
            }
            onOpenChange={setOpen}
          >
            <Button icon={ImageIcon} size={'small'} {...stylex.props(styles.changeCover)}>
              {t('docs.cover.change')}
            </Button>
          </Popover>
        )}
      </LibraryCover>
      <Flexbox gap={6} paddingBlock={16} paddingInline={24}>
        <Flexbox horizontal align={'center'} gap={8}>
          <LibraryStatusIcon
            memberRestricted={(library as { memberRestricted?: boolean }).memberRestricted}
            size={20}
            visibility={library.visibility}
          />
          <h1 {...stylex.props(styles.title)}>{library.name}</h1>
        </Flexbox>
        {library.description ? (
          <div {...stylex.props(styles.description)}>{library.description}</div>
        ) : (
          <Text fontSize={13} type={'secondary'}>
            {t('docs.library.noDescription')}
          </Text>
        )}
      </Flexbox>
    </Flexbox>
  );
});

LibraryHero.displayName = 'LibraryHero';

export default LibraryHero;
