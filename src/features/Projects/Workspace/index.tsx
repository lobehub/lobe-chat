'use client';

import { Button, Center, Flexbox, Spin, Tag, Text, TextArea } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { SendHorizontalIcon, SparklesIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import AsyncError from '@/components/AsyncError';
import { getProjectConversationStartPath } from '@/features/Projects/Layout/navigation';
import ProjectDisabled from '@/features/Projects/ProjectDisabled';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { useCurrentProjectDetail, useProjectStore } from '@/store/project';
import { useUserStore } from '@/store/user';
import { labPreferSelectors } from '@/store/user/selectors';

import moduleStyles from './index.module.css';
import ProjectDashboard from './ProjectDashboard';

const styles = stylex.create({
  composer: {
    overflow: 'hidden',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: cssVar.colorBorder,
    borderRadius: '18px',
    backgroundColor: cssVar.colorBgContainer,
    backgroundImage: 'none',
    boxShadow: cssVar.boxShadowSecondary,
  },
  composerFooter: {
    paddingBlockStart: '6px',
    paddingBlockEnd: '8px',
    paddingInlineStart: '14px',
    paddingInlineEnd: '8px',
  },
  content: { overflow: 'auto', width: '100%' },
  intro: { width: '100%', maxWidth: '760px' },
  page: {
    boxSizing: 'border-box',
    width: {
      'default': 'min(1060px, calc(100% - 64px))',
      '@media (width <= 720px)': 'calc(100% - 40px)',
    },
    marginInline: 'auto',
    paddingBlockStart: { 'default': '42px', '@media (width <= 720px)': '32px' },
    paddingBlockEnd: { 'default': '72px', '@media (width <= 720px)': '48px' },
  },
  prompt: {
    cursor: 'pointer',
    paddingBlock: '5px',
    paddingInline: '10px',
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: '999px',
    color: { 'default': cssVar.colorTextSecondary, ':hover': cssVar.colorText },
    backgroundColor: { 'default': cssVar.colorFillQuaternary, ':hover': cssVar.colorFillTertiary },
    backgroundImage: 'none',
  },
  shell: {
    overflow: 'hidden',
    height: '100%',
    backgroundColor: cssVar.colorBgContainer,
    backgroundImage: 'none',
  },
});

const ProjectWorkspace = memo(() => {
  const { t } = useTranslation('project');
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useWorkspaceAwareNavigate();
  const enabled = useUserStore(labPreferSelectors.enableProjects);
  const detail = useCurrentProjectDetail(projectId);
  const [message, setMessage] = useState('');
  const { error, revalidate } = useProjectStore((s) => s.useFetchProjectDetail)(projectId);

  if (!enabled) return <ProjectDisabled />;
  if (error && !detail)
    return <AsyncError error={error} variant={'page'} onRetry={() => revalidate()} />;
  if (!detail)
    return (
      <Center height={'100%'}>
        <Spin size="small" />
      </Center>
    );

  const startConversation = () => {
    const content = message.trim();
    if (!content || !projectId) return;
    navigate(getProjectConversationStartPath(detail.project.slug ?? projectId, content));
  };
  const prompts = [
    t('overview.prompts.summarizeProgress'),
    t('overview.prompts.planMilestone'),
    t('overview.prompts.findBlockers'),
  ];

  return (
    <Flexbox className={stylex.props(styles.shell).className} flex={1}>
      <div {...stylex.props(styles.content)}>
        <Flexbox className={stylex.props(styles.page).className} gap={0}>
          <Flexbox className={stylex.props(styles.intro).className} gap={18}>
            <Flexbox gap={5}>
              <Text fontSize={26} weight={650}>
                {t('overview.title')}
              </Text>
              <Text type={'secondary'}>{t('overview.description')}</Text>
            </Flexbox>
            <Flexbox gap={10}>
              <Flexbox className={stylex.props(styles.composer).className}>
                <TextArea
                  autoFocus
                  autoSize={{ maxRows: 7, minRows: 3 }}
                  className={moduleStyles.textarea}
                  placeholder={t('overview.composerPlaceholder')}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter')
                      startConversation();
                  }}
                />
                <Flexbox
                  horizontal
                  align={'center'}
                  className={stylex.props(styles.composerFooter).className}
                  justify={'space-between'}
                >
                  <Flexbox horizontal align={'center'} gap={7}>
                    <Tag icon={<SparklesIcon size={12} />}>{detail.project.name}</Tag>
                    <Text fontSize={12} type={'secondary'}>
                      {t('overview.contextEnabled')}
                    </Text>
                  </Flexbox>
                  <Button
                    disabled={!message.trim()}
                    icon={SendHorizontalIcon}
                    type={'primary'}
                    onClick={startConversation}
                  />
                </Flexbox>
              </Flexbox>
              <Flexbox horizontal gap={8} wrap={'wrap'}>
                {prompts.map((prompt) => (
                  <button
                    {...stylex.props(styles.prompt)}
                    key={prompt}
                    type={'button'}
                    onClick={() => setMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </Flexbox>
            </Flexbox>
          </Flexbox>
          <ProjectDashboard detail={detail} projectId={detail.project.id} />
        </Flexbox>
      </div>
    </Flexbox>
  );
});

ProjectWorkspace.displayName = 'ProjectWorkspace';

export default ProjectWorkspace;
