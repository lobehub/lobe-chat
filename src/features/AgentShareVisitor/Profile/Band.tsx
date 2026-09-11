'use client';

import { DEFAULT_AVATAR } from '@lobechat/const';
import type { SharedAgentData } from '@lobechat/types';
import { agentDisplayName } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui';
import { Avatar, Text } from '@lobehub/ui/base-ui';
import { createStaticStyles } from 'antd-style';
import { ArrowRight } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { buildBandTheme } from './bandTheme';

const styles = createStaticStyles(({ css }) => ({
  /**
   * The agent's own colour carries the top of the page. LobeHub's chrome is
   * monochrome by default, so this is the one surface where the *agent* is
   * allowed to hold the palette — every shared agent gets a visibly different
   * header from one implementation. See `bandTheme` for why the creator's
   * colour is re-lit rather than used raw.
   */
  band: css`
    isolation: isolate;
    position: relative;

    overflow: hidden;

    padding-block: 40px 44px;
    padding-inline: 24px;

    background: var(--share-band-field);
  `,
  cta: css`
    cursor: pointer;

    display: inline-flex;
    gap: 8px;
    align-items: center;
    justify-content: center;

    block-size: 44px;
    padding-inline: 26px;
    border: none;
    border-radius: 999px;

    font-family: inherit;
    font-size: 15px;
    font-weight: 600;
    color: #fff;

    background: var(--share-band-accent);

    transition:
      background 160ms ease,
      transform 140ms ease;

    &:hover {
      background: var(--share-band-accent-hover);
    }

    &:active {
      transform: scale(0.98);
    }
  `,
  description: css`
    max-inline-size: 52ch;
    font-size: 15px;
    line-height: 1.75;
    color: rgb(255 255 255 / 62%);
  `,
  /** Depth behind the avatar, so a flat fill does not read as a grey slab. */
  glow: css`
    pointer-events: none;

    position: absolute;
    z-index: 0;
    inset-block-start: -55%;
    inset-inline-start: -6%;

    aspect-ratio: 1;
    inline-size: min(560px, 52%);

    opacity: 0.55;
    background: radial-gradient(closest-side, var(--share-band-lift), transparent 72%);
  `,
  inner: css`
    position: relative;
    z-index: 1;

    inline-size: 100%;
    max-inline-size: 960px;
    margin-inline: auto;
  `,
  name: css`
    font-size: clamp(28px, 3.4vw, 36px);
    font-weight: 650;
    line-height: 1.15;
    color: rgb(255 255 255 / 95%);
    letter-spacing: -0.025em;
  `,
  note: css`
    font-size: 12px;
    color: rgb(255 255 255 / 46%);
  `,
  /** Role marker, kept beside the name rather than under it so the title reads as one line. */
  role: css`
    padding-block: 4px;
    padding-inline: 11px;
    border: 1px solid rgb(255 255 255 / 22%);
    border-radius: 999px;

    font-size: 13px;
    color: rgb(255 255 255 / 80%);
    white-space: nowrap;
  `,
  subtle: css`
    font-size: 13px;
    color: rgb(255 255 255 / 56%);
  `,
  tag: css`
    padding-block: 3px;
    padding-inline: 10px;
    border: 1px solid rgb(255 255 255 / 16%);
    border-radius: 999px;

    font-size: 12px;
    color: rgb(255 255 255 / 70%);
  `,
}));

interface BandProps {
  data: SharedAgentData;
  onStart: () => void;
}

/**
 * Identity block of the share profile: who made it, what it is, and the one
 * action worth taking. Deliberately first — a link recipient is deciding
 * whether this agent deserves their attention, and the surface this replaced
 * answered that with an empty composer.
 */
const Band = memo<BandProps>(({ data, onStart }) => {
  const { t } = useTranslation('agent');
  const { agentMeta, creator } = data;
  const theme = buildBandTheme(agentMeta.backgroundColor);

  return (
    <div
      className={styles.band}
      style={
        {
          '--share-band-accent': theme.accent,
          '--share-band-accent-hover': theme.accentHover,
          '--share-band-field': theme.field,
          '--share-band-lift': theme.lift,
        } as never
      }
    >
      <div className={styles.glow} />
      <Flexbox className={styles.inner} gap={22}>
        {creator.name && (
          <Flexbox horizontal align={'center'} gap={8}>
            {creator.avatar && <Avatar avatar={creator.avatar} size={22} />}
            <Text className={styles.subtle}>
              {t('share.visitor.profile.createdBy', { creator: creator.name })}
            </Text>
          </Flexbox>
        )}

        <Flexbox horizontal align={'center'} gap={18}>
          <Avatar
            avatar={agentMeta.avatar ?? DEFAULT_AVATAR}
            background={agentMeta.backgroundColor ?? undefined}
            size={76}
          />
          <Flexbox flex={1} gap={10} style={{ minWidth: 0 }}>
            <Flexbox horizontal align={'center'} gap={12} style={{ flexWrap: 'wrap' }}>
              <Text className={styles.name}>{agentDisplayName(agentMeta)}</Text>
              {agentMeta.title && <span className={styles.role}>{agentMeta.title}</span>}
            </Flexbox>
            {agentMeta.tags.length > 0 && (
              <Flexbox horizontal gap={6} style={{ flexWrap: 'wrap' }}>
                {agentMeta.tags.map((tag) => (
                  <span className={styles.tag} key={tag}>
                    {tag}
                  </span>
                ))}
              </Flexbox>
            )}
          </Flexbox>
        </Flexbox>

        {agentMeta.description && (
          <Text className={styles.description}>{agentMeta.description}</Text>
        )}

        <Flexbox horizontal align={'center'} gap={14} style={{ flexWrap: 'wrap' }}>
          <button className={styles.cta} type={'button'} onClick={onStart}>
            {t('share.visitor.profile.cta')}
            <ArrowRight size={17} />
          </button>
          <Text className={styles.note}>{t('share.visitor.profile.freeNote')}</Text>
        </Flexbox>
      </Flexbox>
    </div>
  );
});

Band.displayName = 'AgentShareProfileBand';

export default Band;
