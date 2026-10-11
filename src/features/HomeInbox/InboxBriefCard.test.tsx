import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { type BriefItem } from '@/features/DailyBrief/types';

import zhCNHome from '../../../locales/zh-CN/home.json';
import InboxBriefCard from './InboxBriefCard';

// Render with the shipped zh-CN copy so a missing key shows up as its raw key.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options: Record<string, unknown> = {}) =>
      Object.entries(options).reduce<string>(
        (content, [name, value]) => content.replace(`{{${name}}}`, String(value)),
        (zhCNHome as Record<string, string>)[key] ?? key,
      ),
  }),
}));

vi.mock('@/features/Home/components/Time', () => ({ default: () => null }));

const renderCard = (ui: ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

const createSkillAction = (title: string, rationale: string) => ({
  actionType: 'create_skill',
  baseSnapshot: { absent: true, skillName: title.toLowerCase(), targetType: 'skill' },
  evidenceRefs: [],
  idempotencyKey: `create:${title}`,
  operation: {
    domain: 'skill',
    input: { bodyMarkdown: '# body', description: `${title} skill`, name: title, title },
    operation: 'create',
  },
  rationale,
  risk: 'low',
  target: { skillName: title.toLowerCase() },
});

/** A proposal brief as stored before the projection named the change. */
const legacyProposalBrief = (actions: unknown[], summary?: string): BriefItem => ({
  actions: [
    { key: 'approve', label: 'Apply', type: 'resolve' },
    { key: 'dismiss', label: 'Dismiss', type: 'resolve' },
    { key: 'feedback', label: 'Request changes', type: 'comment' },
  ],
  agent: { avatar: null, backgroundColor: null, id: 'agent-1', name: null, title: '代码助手' },
  agentId: 'agent-1',
  artifacts: null,
  createdAt: '2026-10-12T00:00:00.000Z',
  cronJobId: null,
  id: 'brief-1',
  metadata: {
    agentSignal: {
      nightlySelfReview: {
        outcome: 'proposal',
        selfReviewProposal: { actions, status: 'pending', ...(summary ? { summary } : {}) },
      },
    },
  },
  priority: 'normal',
  readAt: null,
  resolvedAction: null,
  resolvedAt: null,
  resolvedComment: null,
  summary: '有 1 条夜间回顾建议需要你确认。',
  taskId: null,
  title: '有夜间回顾建议需要确认',
  topicId: null,
  type: 'decision',
  userId: 'user-1',
});

describe('InboxBriefCard — nightly self-review proposal', () => {
  it('shows the proposed skill, its agent and rationale instead of the generic copy', () => {
    renderCard(
      <InboxBriefCard
        brief={legacyProposalBrief([
          createSkillAction('PR checklist', '用户三次要求相同的 PR 审查步骤。'),
        ])}
      />,
    );

    expect(screen.getByText('新建技能：PR checklist')).toBeInTheDocument();
    expect(screen.getByText('适用于助理「代码助手」')).toBeInTheDocument();
    expect(screen.getByText('用户三次要求相同的 PR 审查步骤。')).toBeInTheDocument();
    expect(screen.queryByText('有夜间回顾建议需要确认')).not.toBeInTheDocument();
    expect(screen.queryByText('有 1 条夜间回顾建议需要你确认。')).not.toBeInTheDocument();
  });

  it('lists each action of a multi-action proposal and folds the tail', () => {
    renderCard(
      <InboxBriefCard
        brief={legacyProposalBrief(
          [
            createSkillAction('PR checklist', '重复的审查步骤。'),
            {
              actionType: 'refine_skill',
              baseSnapshot: { targetTitle: '发布说明' },
              rationale: '发布说明总是漏掉迁移章节。',
            },
            { actionType: 'refine_prompt', rationale: '用用户的语言回答。' },
            createSkillAction('Deploy', '部署前检查。'),
          ],
          '三项改动能减少重复劳动。',
        )}
      />,
    );

    expect(screen.getByText('新建技能：PR checklist（另有 3 项）')).toBeInTheDocument();
    expect(screen.getByText('三项改动能减少重复劳动。')).toBeInTheDocument();
    expect(screen.getByText('发布说明')).toBeInTheDocument();
    expect(screen.getByText('发布说明总是漏掉迁移章节。')).toBeInTheDocument();
    expect(screen.getByText('优化系统提示词')).toBeInTheDocument();
    expect(screen.queryByText('Deploy')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('另有 1 项'));

    expect(screen.getByText('Deploy')).toBeInTheDocument();
  });

  it('keeps approve / dismiss with localized labels', () => {
    renderCard(
      <InboxBriefCard brief={legacyProposalBrief([createSkillAction('PR checklist', '原因')])} />,
    );

    expect(screen.getByRole('button', { name: '批准' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '不采纳' })).toBeInTheDocument();
    expect(screen.queryByText('Dismiss')).not.toBeInTheDocument();
  });

  it('keeps the stored text for briefs without proposal details', () => {
    renderCard(
      <InboxBriefCard
        brief={{ ...legacyProposalBrief([]), metadata: null, title: 'Plain decision' }}
      />,
    );

    expect(screen.getByText('Plain decision')).toBeInTheDocument();
  });
});
