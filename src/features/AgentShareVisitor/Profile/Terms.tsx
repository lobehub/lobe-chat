'use client';

import type { SharedAgentData } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui';
import { Text } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const styles = createStaticStyles(({ css }) => ({
  row: css`
    padding-block: 12px;
    border-block-start: 1px solid ${cssVar.colorBorderSecondary};

    &:first-child {
      border-block-start: 0;
    }
  `,
}));

/**
 * The share's rules, stated before the visitor invests. Every line here
 * already governs the runtime; until now each one only surfaced as an error
 * after the visitor had typed something (`share.visitor.errors.*`).
 */
const Terms = memo<{ data: SharedAgentData }>(({ data }) => {
  const { t } = useTranslation('agent');
  const { terms, toolGrants } = data;

  const lines = [
    t('share.visitor.profile.terms.account'),
    terms.allowCreatorViewSessions
      ? t('share.visitor.profile.terms.visibilityCreator')
      : t('share.visitor.profile.terms.visibilityPrivate'),
    t('share.visitor.profile.terms.turns', { count: terms.maxTurnsPerTopic }),
    t('share.visitor.profile.terms.topics', { count: terms.maxTopicsPerVisitor }),
    t('share.visitor.profile.terms.tools', { count: toolGrants.length }),
  ];

  return (
    <Flexbox gap={12}>
      <Flexbox gap={4}>
        <Text fontSize={17} weight={600}>
          {t('share.visitor.profile.terms.title')}
        </Text>
        <Text fontSize={13} type={'secondary'}>
          {t('share.visitor.profile.terms.desc')}
        </Text>
      </Flexbox>
      <div>
        {lines.map((line) => (
          <div className={styles.row} key={line}>
            <Text fontSize={14} type={'secondary'}>
              {line}
            </Text>
          </div>
        ))}
      </div>
    </Flexbox>
  );
});

Terms.displayName = 'AgentShareProfileTerms';

export default Terms;
