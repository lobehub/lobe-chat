'use client';

import { FormGroup, Grid } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';

import TotalAssistants from './features/TotalAssistants';
import TotalMessages from './features/TotalMessages';
import TotalTopics from './features/TotalTopics';

const Client = memo<{ mobile?: boolean }>(() => {
  const { t } = useTranslation('auth');

  return (
    <FormGroup style={FORM_STYLE.style} title={t('tab.stats')} variant={'pure'}>
      <Grid paddingBlock={16}>
        <TotalAssistants />
        <TotalTopics />
        <TotalMessages />
      </Grid>
    </FormGroup>
  );
});

export default Client;
