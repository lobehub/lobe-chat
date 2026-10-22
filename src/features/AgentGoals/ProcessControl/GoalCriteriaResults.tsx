'use client';

import { Flexbox, Icon, Image, Markdown, Skeleton, Text } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import {
  ChevronRight,
  CircleCheck,
  CircleDashed,
  CircleX,
  FileText,
  Paperclip,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AsyncError from '@/components/AsyncError';
import { useEntityMarkdown } from '@/features/EntityLink';
import { useChatStore } from '@/store/chat';

import { SectionTitle } from './GoalResultFollowUps';
import type { CriterionOutcome, CriterionOutcomeState, EvidenceLike } from './goalResultState';

/**
 * 验收标准 × 结果 — each criterion the Goal was accepted against, next to what
 * the latest acceptance round found: met or not, and why when it was not. A row
 * opens into its evidence — screenshots, written evidence, the documents it
 * cites — in place, without framing the content in another card. The round's own
 * write-up for a met criterion belongs to the acceptance, not to this summary.
 */

const styles = stylex.create({
  arrow: { flex: 'none', color: cssVar.colorTextQuaternary, transition: 'transform 0.2s' },
  arrowOpen: { transform: 'rotate(90deg)' },
  evidence: {
    paddingBlockStart: '0',
    paddingBlockEnd: '12px',
    paddingInlineStart: '28px',
    paddingInlineEnd: '0',
  },
  item: {
    borderBlockEndWidth: { 'default': null, ':not(:last-child)': '1px' },
    borderBlockEndStyle: { 'default': null, ':not(:last-child)': 'solid' },
    borderBlockEndColor: { 'default': null, ':not(:last-child)': cssVar.colorBorderSecondary },
  },
  reason: { color: cssVar.colorError },
  row: {
    width: '100%',
    paddingBlock: '10px',
    paddingInline: '0',
    borderStyle: 'none',
    textAlign: 'start',
    backgroundColor: 'transparent',
    backgroundImage: 'none',
  },
  rowOpenable: {
    cursor: 'pointer',
    backgroundColor: { 'default': null, ':hover': cssVar.colorFillQuaternary },
    backgroundImage: { 'default': null, ':hover': 'none' },
    outlineWidth: { 'default': null, ':focus-visible': '2px' },
    outlineStyle: { 'default': null, ':focus-visible': 'solid' },
    outlineColor: { 'default': null, ':focus-visible': cssVar.colorPrimary },
    outlineOffset: { 'default': null, ':focus-visible': '-2px' },
  },
  docLink: {
    cursor: 'pointer',
    width: 'fit-content',
    padding: '0',
    borderStyle: 'none',
    color: cssVar.colorPrimary,
    backgroundColor: 'transparent',
    backgroundImage: 'none',
    textDecoration: { 'default': null, ':hover': 'underline' },
  },
});

const STATE_ICON: Record<CriterionOutcomeState, typeof CircleCheck> = {
  failed: CircleX,
  passed: CircleCheck,
  unjudged: CircleDashed,
};

const STATE_COLOR: Record<CriterionOutcomeState, string> = {
  failed: cssVar.colorError,
  passed: cssVar.colorSuccess,
  unjudged: cssVar.colorTextQuaternary,
};

const IMAGE_TYPES = new Set(['screenshot', 'gif']);

const EvidenceItem = ({ item }: { item: EvidenceLike }) => {
  const { t } = useTranslation('chat');
  const openDocument = useChatStore((s) => s.openDocument);
  const markdownProps = useEntityMarkdown();
  const caption = item.description || item.fileName;

  if (IMAGE_TYPES.has(item.type) && item.fileUrl)
    return (
      <Flexbox gap={4}>
        <Image
          preview
          alt={caption ?? item.type}
          loading={'lazy'}
          src={item.fileUrl}
          style={{ maxHeight: 360, objectFit: 'contain', width: '100%' }}
          variant={'borderless'}
        />
        {caption && (
          <Text fontSize={12} type={'secondary'}>
            {caption}
          </Text>
        )}
      </Flexbox>
    );

  if (item.type === 'video' && item.fileUrl)
    return <video controls src={item.fileUrl} style={{ display: 'block', width: '100%' }} />;

  if (item.content)
    return (
      <Flexbox gap={4}>
        {caption && (
          <Text fontSize={12} type={'secondary'}>
            {caption}
          </Text>
        )}
        <Markdown fontSize={13} variant={'chat'} {...markdownProps}>
          {item.content}
        </Markdown>
      </Flexbox>
    );

  if (item.documentId)
    return (
      <Flexbox horizontal align={'center'} gap={6}>
        <Icon color={cssVar.colorTextTertiary} icon={FileText} size={14} />
        <button
          {...stylex.props(styles.docLink)}
          type={'button'}
          onClick={() => openDocument(item.documentId!)}
        >
          {caption || t('goalProcess.result.criteria.document')}
        </button>
      </Flexbox>
    );

  if (item.fileUrl)
    return (
      <Flexbox horizontal align={'center'} gap={6}>
        <Icon color={cssVar.colorTextTertiary} icon={Paperclip} size={14} />
        <a href={item.fileUrl} rel={'noopener noreferrer'} target={'_blank'}>
          {caption || item.type}
        </a>
      </Flexbox>
    );

  return caption ? (
    <Text fontSize={13} type={'secondary'}>
      {caption}
    </Text>
  ) : null;
};

const CriterionRow = ({ index, outcome }: { index: number; outcome: CriterionOutcome }) => {
  const { t } = useTranslation('chat');
  const [open, setOpen] = useState(false);
  const { criterion, evidence, reason, state } = outcome;
  const openable = evidence.length > 0;
  const color = STATE_COLOR[state];

  return (
    <div
      {...stylex.props(styles.item)}
      data-criterion-id={criterion.id}
      data-criterion-state={state}
    >
      <Flexbox
        horizontal
        align={'flex-start'}
        as={openable ? 'button' : 'div'}
        className={stylex.props(styles.row, openable && styles.rowOpenable).className}
        gap={10}
        {...(openable ? { onClick: () => setOpen(!open), type: 'button' as const } : {})}
      >
        <Icon
          color={color}
          icon={STATE_ICON[state]}
          size={18}
          style={{ flex: 'none', marginBlockStart: 1 }}
        />
        <Flexbox flex={1} gap={3} style={{ minWidth: 0 }}>
          <Flexbox horizontal align={'baseline'} gap={8}>
            <Text style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }} weight={500}>
              {index + 1}. {criterion.title}
            </Text>
            <Text fontSize={12} style={{ color, flex: 'none' }} weight={500}>
              {t(`goalProcess.result.criteria.state.${state}`)}
            </Text>
          </Flexbox>
          {state === 'failed' && reason && (
            <Text
              className={stylex.props(styles.reason).className}
              fontSize={13}
              style={{ wordBreak: 'break-word' }}
            >
              {reason}
            </Text>
          )}
          {state === 'unjudged' && (
            <Text fontSize={13} type={'secondary'}>
              {reason ?? t('goalProcess.result.criteria.unjudgedHint')}
            </Text>
          )}
        </Flexbox>
        {openable && (
          <Flexbox
            horizontal
            align={'center'}
            gap={4}
            style={{ flex: 'none', marginBlockStart: 2 }}
          >
            <Text fontSize={12} type={'secondary'}>
              {t('goalProcess.result.criteria.evidenceCount', { count: evidence.length })}
            </Text>
            <Icon
              className={stylex.props(styles.arrow, open && styles.arrowOpen).className}
              icon={ChevronRight}
              size={14}
            />
          </Flexbox>
        )}
      </Flexbox>
      {open && (
        <Flexbox className={stylex.props(styles.evidence).className} gap={12}>
          {evidence.map((item) => (
            <EvidenceItem item={item} key={item.id} />
          ))}
        </Flexbox>
      )}
    </div>
  );
};

interface GoalCriteriaResultsProps {
  /** The per-task acceptance group, rendered as this section's continuation. */
  children?: ReactNode;
  /** The acceptance or criteria read failed: its outcomes are not a result. */
  error?: unknown;
  loading: boolean;
  onRetry?: () => void;
  outcomes: CriterionOutcome[];
}

const GoalCriteriaResults = ({
  children,
  error,
  loading,
  onRetry,
  outcomes,
}: GoalCriteriaResultsProps) => {
  const { t } = useTranslation('chat');
  const met = outcomes.filter((outcome) => outcome.state === 'passed').length;

  return (
    <Flexbox gap={8}>
      <SectionTitle
        extra={
          !error &&
          outcomes.length > 0 && (
            <Text fontSize={13} type={'secondary'}>
              {t('goalProcess.result.scale.criteria', { met, total: outcomes.length })}
            </Text>
          )
        }
      >
        {t('goalProcess.result.criteria.title')}
      </SectionTitle>
      {error ? (
        <AsyncError error={error} variant={'block'} onRetry={onRetry} />
      ) : loading ? (
        <Flexbox gap={10}>
          <Skeleton height={18} radius={4} />
          <Skeleton height={18} radius={4} />
          <Skeleton height={18} radius={4} width={'70%'} />
        </Flexbox>
      ) : outcomes.length === 0 ? (
        <Text fontSize={13} type={'secondary'}>
          {t('goalProcess.result.criteria.empty')}
        </Text>
      ) : (
        <Flexbox>
          {outcomes.map((outcome, index) => (
            <CriterionRow index={index} key={outcome.criterion.id} outcome={outcome} />
          ))}
        </Flexbox>
      )}
      {children}
    </Flexbox>
  );
};

export default GoalCriteriaResults;
