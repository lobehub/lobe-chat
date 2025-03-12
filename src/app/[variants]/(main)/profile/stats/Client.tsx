'use client';

import { FormGroup, Grid } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';

import AiHeatmaps from './features/AiHeatmaps';
import AssistantsRank from './features/AssistantsRank';
import ModelsRank from './features/ModelsRank';
import ShareButton from './features/ShareButton';
import TopicsRank from './features/TopicsRank';
import TotalAssistants from './features/TotalAssistants';
import TotalMessages from './features/TotalMessages';
import TotalTopics from './features/TotalTopics';
import TotalWords from './features/TotalWords';
import Welcome from './features/Welcome';

const Client = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('auth');

  return (
    <Flexbox gap={mobile ? 0 : 24}>
      {mobile ? (
        <Welcome mobile />
      ) : (
        <Flexbox align={'flex-start'} gap={16} horizontal justify={'space-between'}>
          <Welcome />
          <ShareButton />
        </Flexbox>
      )}
      <FormGroup style={FORM_STYLE.style} title={t('tab.stats')} variant={'pure'}>
        <Grid maxItemWidth={150} paddingBlock={16} rows={4}>
          <TotalAssistants mobile={mobile} />
          <TotalTopics mobile={mobile} />
          <TotalMessages mobile={mobile} />
          <TotalWords />
        </Grid>
      </FormGroup>
      <AiHeatmaps mobile={mobile} />
      <Grid gap={mobile ? 0 : 48} rows={3}>
        <ModelsRank />
        <AssistantsRank mobile={mobile} />
        <TopicsRank mobile={mobile} />
      </Grid>
    </Flexbox>
  );
});

export default Client;
