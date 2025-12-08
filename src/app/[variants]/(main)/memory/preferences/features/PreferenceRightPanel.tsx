'use client';

import { Block, Icon, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Lightbulb } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import CateTag from '@/app/[variants]/(main)/memory/features/CateTag';
import DetailPanel from '@/app/[variants]/(main)/memory/features/DetailPanel';
import HashTags from '@/app/[variants]/(main)/memory/features/HashTags';
import HighlightedContent from '@/app/[variants]/(main)/memory/features/HighlightedContent';
import ProgressIcon from '@/app/[variants]/(main)/memory/features/ProgressIcon';
import SourceLink from '@/app/[variants]/(main)/memory/features/SourceLink';
import Time from '@/app/[variants]/(main)/memory/features/Time';
import { useQueryState } from '@/hooks/useQueryParam';
import { useUserMemoryStore } from '@/store/userMemory';

const useStyles = createStyles(({ css, token }) => ({
  suggestions: css`
    border-color: ${token.colorInfoBorder};
    background: ${token.colorInfoBg};
  `,

  suggestionsTitle: css`
    font-size: 16px;
    font-weight: 500;
    color: ${token.colorInfo};
  `,
}));

const PreferenceRightPanel = memo(() => {
  const { t } = useTranslation('memory');
  const { styles } = useStyles();
  const [preferenceId] = useQueryState('preferenceId', { clearOnDefault: true });
  const preferences = useUserMemoryStore((s) => s.preferences);

  const preference = useMemo(() => {
    if (!preferenceId) return null;
    return preferences.find((p) => p.id === preferenceId) || null;
  }, [preferenceId, preferences]);

  if (!preference) return null;

  return (
    <DetailPanel>
      <CateTag cate={preference.type} />
      <Text
        as={'h1'}
        fontSize={20}
        style={{
          lineHeight: 1.4,
          marginBottom: 0,
        }}
        weight={'bold'}
      >
        {preference.title || preference.type || t('preference.defaultType')}
      </Text>
      <Flexbox align="center" gap={16} horizontal justify="space-between">
        <ProgressIcon
          format={(percent) => `Priority: ${percent}%`}
          percent={(preference.scorePriority ?? 0) * 100}
          showInfo
        />
      </Flexbox>
      <Flexbox align="center" gap={16} horizontal justify="space-between">
        <SourceLink source={preference.source} />
        <Time updatedAt={preference.createdAt} />
      </Flexbox>

      {preference.conclusionDirectives && (
        <HighlightedContent>{preference.conclusionDirectives}</HighlightedContent>
      )}

      {preference.suggestions && (
        <Block className={styles.suggestions} gap={8} padding={16} variant={'outlined'}>
          <Flexbox align={'center'} className={styles.suggestionsTitle} gap={6} horizontal>
            <Icon icon={Lightbulb} />
            {t('preference.suggestions')}
          </Flexbox>
          <HighlightedContent>{preference.suggestions}</HighlightedContent>
        </Block>
      )}

      <HashTags hashTags={preference.tags} />
    </DetailPanel>
  );
});

export default PreferenceRightPanel;
