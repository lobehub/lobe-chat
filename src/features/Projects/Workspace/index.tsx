'use client';

import {
  Button,
  createStaticStyles,
  cssVar,
  Flexbox,
  Segmented,
  Text,
  TextArea,
  toast,
} from '@lobehub/ui';
import { SendHorizontalIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import AsyncError from '@/components/AsyncError';
import { RouteLoading } from '@/components/Skeleton/RouteSegment';
import ProjectDisabled from '@/features/Projects/ProjectDisabled';
import type { ProjectDetail } from '@/store/project';
import { useCurrentProjectDetail, useProjectStore } from '@/store/project';
import { useUserStore } from '@/store/user';
import { labPreferSelectors } from '@/store/user/selectors';

import ProjectDashboard from './ProjectDashboard';
import { type ProjectComposerMode, useProjectComposer } from './useProjectComposer';

const styles = createStaticStyles(({ css }) => ({
  composer: css`
    overflow: hidden;

    border: 1px solid ${cssVar.colorBorder};
    border-radius: 18px;

    background: ${cssVar.colorBgContainer};
    box-shadow: ${cssVar.boxShadowSecondary};
  `,
  composerFooter: css`
    padding-block: 6px 8px;
    padding-inline: 14px 8px;
  `,
  content: css`
    overflow: auto;
    width: 100%;
  `,
  heading: css`
    text-align: center;
  `,
  intro: css`
    width: 100%;
    max-width: 760px;
    margin-inline: auto;
  `,
  page: css`
    box-sizing: border-box;
    width: min(1060px, calc(100% - 64px));
    margin-inline: auto;
    padding-block: 42px 72px;

    @media (width <= 720px) {
      width: calc(100% - 40px);
      padding-block: 32px 48px;
    }
  `,
  shell: css`
    overflow: hidden;
    height: 100%;
    background: ${cssVar.colorBgContainer};
  `,
  textarea: css`
    padding-block: 15px 8px !important;
    padding-inline: 16px !important;
    border: 0 !important;

    font-size: 15px !important;

    background: transparent !important;
    box-shadow: none !important;
  `,
}));

const ProjectComposer = ({ project }: { project: ProjectDetail['project'] }) => {
  const { t } = useTranslation('project');
  const [mode, setMode] = useState<ProjectComposerMode>('chat');
  const { draft: message, send, sending, setDraft: setMessage } = useProjectComposer(project);

  const submit = async () => {
    try {
      await send(mode);
    } catch (error) {
      console.error('Failed to send from the project home', error);
      toast.error(t(mode === 'task' ? 'overview.createTaskFailed' : 'overview.sendFailed'));
    }
  };

  return (
    <Flexbox className={styles.composer}>
      <TextArea
        autoFocus
        autoSize={{ maxRows: 7, minRows: 3 }}
        className={styles.textarea}
        disabled={sending}
        value={message}
        placeholder={t(
          mode === 'task' ? 'overview.taskPlaceholder' : 'overview.composerPlaceholder',
        )}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') void submit();
        }}
      />
      <Flexbox
        horizontal
        align={'center'}
        className={styles.composerFooter}
        justify={'space-between'}
      >
        <Segmented
          size={'small'}
          value={mode}
          options={[
            { label: t('overview.mode.chat'), value: 'chat' },
            { label: t('overview.mode.task'), value: 'task' },
          ]}
          onChange={(value) => setMode(value as ProjectComposerMode)}
        />
        <Button
          aria-label={t(mode === 'task' ? 'overview.createTask' : 'overview.startConversation')}
          disabled={!message.trim()}
          icon={SendHorizontalIcon}
          loading={sending}
          shape={'circle'}
          type={'primary'}
          onClick={submit}
        />
      </Flexbox>
    </Flexbox>
  );
};

const ProjectWorkspace = memo(() => {
  const { t } = useTranslation('project');
  const { projectId } = useParams<{ projectId: string }>();
  const enabled = useUserStore(labPreferSelectors.enableProjects);
  const detail = useCurrentProjectDetail(projectId);
  const { error, revalidate } = useProjectStore((s) => s.useFetchProjectDetail)(projectId);

  if (!enabled) return <ProjectDisabled />;
  if (error && !detail)
    return <AsyncError error={error} variant={'page'} onRetry={() => revalidate()} />;
  if (!detail) return <RouteLoading />;

  return (
    <Flexbox className={styles.shell} flex={1}>
      <div className={styles.content}>
        <Flexbox className={styles.page} gap={0}>
          <Flexbox className={styles.intro} gap={18}>
            <Flexbox align={'center'} className={styles.heading} gap={5}>
              <Text fontSize={26} weight={650}>
                {t('overview.title')}
              </Text>
              <Text type={'secondary'}>{t('overview.description')}</Text>
            </Flexbox>
            <ProjectComposer key={detail.project.id} project={detail.project} />
          </Flexbox>
          <ProjectDashboard detail={detail} projectId={detail.project.id} />
        </Flexbox>
      </div>
    </Flexbox>
  );
});

ProjectWorkspace.displayName = 'ProjectWorkspace';

export default ProjectWorkspace;
