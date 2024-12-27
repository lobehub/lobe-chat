'use client';

import { FormGroup, Grid } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';

import AiHeatmaps from './features/AiHeatmaps';
import AssistantsRank from './features/AssistantsRank';
import TopicsRank from './features/TopicsRank';
import TotalAssistants from './features/TotalAssistants';
import TotalMessages from './features/TotalMessages';
import TotalTopics from './features/TotalTopics';

const Client = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('auth');

  return (
    <>
      <FormGroup style={FORM_STYLE.style} title={t('tab.stats')} variant={'pure'}>
        <Grid maxItemWidth={200} paddingBlock={16} rows={3}>
          <TotalAssistants />
          <TotalTopics />
          <TotalMessages />
        </Grid>
      </FormGroup>
      <Grid gap={mobile ? undefined : 48} rows={2}>
        <AssistantsRank />
        <TopicsRank />
      </Grid>
      <AiHeatmaps />
    </>
  );
});

export default Client;
