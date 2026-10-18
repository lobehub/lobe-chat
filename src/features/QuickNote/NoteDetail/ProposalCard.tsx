'use client';

import {
  Button,
  createStaticStyles,
  cssVar,
  Flexbox,
  Icon,
  Markdown,
  Tag,
  Text,
  toast,
} from '@lobehub/ui';
import { ListTodoIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { QuickNoteProposal } from '@/services/quickNote';
import { quickNoteSelectors, useQuickNoteStore } from '@/store/quickNote';

import { openQuickNoteTextEditModal, quickNoteTextEditTitles } from './TextEditModal';

const styles = createStaticStyles(({ css, cssVar: token }) => ({
  card: css`
    padding: 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG};
    background: ${token.colorBgContainer};
  `,
}));

const ProposalCard = memo<{ noteId: string; proposal: QuickNoteProposal }>(
  ({ noteId, proposal }) => {
    const { t } = useTranslation('note');
    const [acceptProposal, dismissProposal, updateProposal] = useQuickNoteStore((s) => [
      s.acceptProposal,
      s.dismissProposal,
      s.updateProposal,
    ]);
    const processing = useQuickNoteStore(quickNoteSelectors.isProcessingProposal(proposal.id));
    const actionable = proposal.validity === 'current';

    const runAction = async (action: () => Promise<unknown>) => {
      try {
        await action();
      } catch {
        toast.error(t('agentic.actionFailed'));
      }
    };

    return (
      <Flexbox className={styles.card} gap={10}>
        <Flexbox horizontal align={'center'} gap={6} justify={'space-between'}>
          <Flexbox horizontal align={'center'} gap={6}>
            <Icon icon={ListTodoIcon} size={14} style={{ color: cssVar.colorTextTertiary }} />
            <Text color={cssVar.colorTextTertiary} fontSize={12}>
              {t(`agentic.proposal.kind.${proposal.kind}` as never)}
            </Text>
          </Flexbox>
          {proposal.validity === 'stale' && <Tag>{t('agentic.proposal.status.stale')}</Tag>}
        </Flexbox>
        <Markdown fontSize={13} variant={'chat'}>
          {proposal.content}
        </Markdown>
        {actionable && (
          <Flexbox horizontal gap={6} justify={'flex-end'} wrap={'wrap'}>
            <Button
              disabled={processing}
              type={'text'}
              onClick={() =>
                openQuickNoteTextEditModal({
                  initialValue: proposal.content,
                  onSave: (content) => updateProposal(noteId, proposal.id, content),
                  title: quickNoteTextEditTitles.proposal(),
                })
              }
            >
              {t('agentic.proposal.edit')}
            </Button>
            <Button
              disabled={processing}
              type={'text'}
              onClick={() => runAction(() => dismissProposal(noteId, proposal.id))}
            >
              {t('agentic.proposal.dismiss')}
            </Button>
            <Button
              loading={processing}
              type={'primary'}
              onClick={() => runAction(() => acceptProposal(noteId, proposal.id))}
            >
              {t('agentic.proposal.createTask')}
            </Button>
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

ProposalCard.displayName = 'QuickNoteProposalCard';

export default ProposalCard;
