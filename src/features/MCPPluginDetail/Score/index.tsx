import { Block, Grid } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import {
  calculateScore,
  calculateScoreFlags,
  createScoreItems,
  sortItemsByPriority,
} from '@/features/MCP/calculateScore';
import { useScoreList } from '@/features/MCP/useScoreList';

import Title from '../../../app/[variants]/(main)/discover/features/Title';
import { useDetailContext } from '../DetailProvider';
import GithubBadge from './GithubBadge';
import ScoreList from './ScoreList';
import TotalScore from './TotalScore';

const Score = memo(() => {
  const { t } = useTranslation('discover');
  const {
    github,
    overview,
    isValidated,
    toolsCount,
    promptsCount,
    resourcesCount,
    deploymentOptions,
  } = useDetailContext();

  // Use utility function to calculate all has* values
  const scoreFlags = calculateScoreFlags({
    deploymentOptions,
    github,
    isClaimed: false, // Detail page doesn't have claimed status yet
    isValidated,
    overview,
    promptsCount,
    resourcesCount,
    toolsCount,
  });

  // Calculate total score and rating
  const scoreItems = createScoreItems(scoreFlags);
  const scoreResult = calculateScore(scoreItems);

  // Use new hook to create score item list
  const scoreListItems = useScoreList();

  // Sort using utility function
  const sortedScoreListItems = sortItemsByPriority(scoreListItems);

  return (
    <Flexbox gap={16}>
      {/* Total score display */}
      <TotalScore
        isValidated={isValidated}
        scoreItems={scoreListItems.map((item) => ({
          check: item.check,
          required: item.required,
          title: item.title,
          weight: item.weight,
        }))}
        scoreResult={scoreResult}
      />

      {/* Score details */}

      <Grid rows={2}>
        <Flexbox gap={16}>
          <Title>{t('mcp.details.score.listTitle')}</Title>
          <Block variant={'outlined'}>
            <ScoreList items={sortedScoreListItems} />
          </Block>
        </Flexbox>
        <Flexbox gap={16}>
          <Title>GitHub Badge</Title>
          <Block gap={16} padding={16} variant={'outlined'}>
            <GithubBadge />
          </Block>
        </Flexbox>
      </Grid>
    </Flexbox>
  );
});

export default Score;
