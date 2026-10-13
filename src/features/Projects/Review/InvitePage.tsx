import { Center, Flexbox } from '@lobehub/ui';
import { Button, Result, Text } from '@lobehub/ui/base-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import AsyncError from '@/components/AsyncError';
import { RouteLoading } from '@/components/Skeleton/RouteSegment';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { useClientDataSWR } from '@/libs/swr';
import { projectReviewKeys } from '@/libs/swr/projectReviewKeys';
import { projectReviewService } from '@/services/projectReview';

export function ProjectInvitePage() {
  const { t } = useTranslation('project');
  const navigate = useWorkspaceAwareNavigate();
  const { token = '' } = useParams<{ token: string }>();
  const { data, error, mutate } = useClientDataSWR(projectReviewKeys.invite(token), () =>
    projectReviewService.getInvite(token),
  );
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState(false);

  if (error) return <AsyncError error={error} variant="page" onRetry={() => mutate()} />;
  if (!data) return <RouteLoading />;

  const home = (
    <Button size="large" onClick={() => navigate('/')}>
      {t('review.invite.home')}
    </Button>
  );

  if (accepted && data.status === 'valid')
    return (
      <Center padding={24} style={{ minHeight: '100dvh' }}>
        <Result
          extra={home}
          status="success"
          subTitle={t('review.invite.acceptedDescription')}
          title={t('review.invite.acceptedTitle', { project: data.projectName })}
        />
      </Center>
    );

  if (data.status !== 'valid')
    return (
      <Center padding={24} style={{ minHeight: '100dvh' }}>
        <Result
          extra={home}
          status="warning"
          subTitle={t(`review.invite.${data.status}Description`)}
          title={t(`review.invite.${data.status}Title`)}
        />
      </Center>
    );

  if (!data.emailMatches)
    return (
      <Center padding={24} style={{ minHeight: '100dvh' }}>
        <Result
          extra={home}
          status="warning"
          subTitle={t('review.invite.otherEmailDescription', { email: data.email })}
          title={t('review.invite.otherEmailTitle')}
        />
      </Center>
    );

  const accept = async () => {
    setAccepting(true);
    setAcceptError(false);
    try {
      await projectReviewService.acceptInvite(token);
      setAccepted(true);
    } catch (error) {
      console.error('Failed to accept project invitation', error);
      setAcceptError(true);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <Center padding={24} style={{ minHeight: '100dvh' }}>
      <Flexbox align="center" gap={16} style={{ maxWidth: 420, textAlign: 'center' }}>
        <Text fontSize={22} weight={700}>
          {data.inviterName
            ? t('review.invite.title', { inviter: data.inviterName, project: data.projectName })
            : t('review.invite.titleAnonymous', { project: data.projectName })}
        </Text>
        <Text type="secondary">
          {t('review.invite.description', { role: t(`review.role.${data.role}`) })}
        </Text>
        <Text fontSize={13} type="secondary">
          {t('review.invite.signedInAs', { email: data.email })}
        </Text>
        {acceptError && <Text type="danger">{t('review.invite.acceptError')}</Text>}
        <Flexbox gap={8} style={{ width: '100%' }}>
          <Button block loading={accepting} size="large" type="primary" onClick={accept}>
            {t('review.invite.accept')}
          </Button>
          <Button block disabled={accepting} size="large" onClick={() => navigate('/')}>
            {t('review.invite.decline')}
          </Button>
        </Flexbox>
      </Flexbox>
    </Center>
  );
}
