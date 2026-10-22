'use client';

import { Button, Flexbox, Icon, Text } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { ExternalLinkIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { SetupGuide as SetupGuideModel } from './guides';

const styles = stylex.create({
  index: {
    display: 'flex',
    flex: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    fontSize: '12px',
    fontWeight: 600,
    color: cssVar.colorTextSecondary,
    backgroundColor: cssVar.colorFillSecondary,
    backgroundImage: 'none',
  },
});

/**
 * A platform's setup as numbered steps, each with a button straight to the
 * console page it happens on. Steps that need the app ID say so until the
 * form has it.
 */
const SetupGuide = memo<{ guide: SetupGuideModel }>(({ guide }) => {
  const { t } = useTranslation('agent');
  const prefix = `channel.quickSetup.${guide.guide}`;

  return (
    <Flexbox data-testid={'channel-setup-guide'} gap={14}>
      {guide.steps.map((step, index) => (
        <Flexbox horizontal align={'flex-start'} gap={10} key={step.key}>
          <span {...stylex.props(styles.index)}>{index + 1}</span>
          <Flexbox flex={1} gap={4} style={{ minWidth: 0 }}>
            <Text fontSize={13} weight={600}>
              {t(`${prefix}.${step.key}.title` as any)}
            </Text>
            <Text fontSize={12} type={'secondary'}>
              {t(`${prefix}.${step.key}.desc` as any)}
            </Text>
            {step.link && (
              <a
                href={step.link.href}
                rel={'noreferrer'}
                style={{ alignSelf: 'flex-start' }}
                target={'_blank'}
              >
                <Button icon={<Icon icon={ExternalLinkIcon} />} size={'small'}>
                  {t(`channel.quickSetup.link.${step.link.label}`)}
                </Button>
              </a>
            )}
            {step.needsApplicationId && (
              <Text fontSize={12} type={'secondary'}>
                {t('channel.quickSetup.needsApplicationId')}
              </Text>
            )}
          </Flexbox>
        </Flexbox>
      ))}
    </Flexbox>
  );
});

SetupGuide.displayName = 'ChannelSetupGuide';

export default SetupGuide;
