'use client';

import { Flexbox } from '@lobehub/ui';
import { createStaticStyles, cssVar } from 'antd-style';

import SkeletonBar from './Bar';

const styles = createStaticStyles(({ css }) => ({
  band: css`
    flex: none;
    background: ${cssVar.colorBgLayout};
  `,
  body: css`
    inline-size: 100%;
    max-inline-size: 960px;
    margin-inline: auto;
  `,
  metrics: css`
    border-block-end: 1px solid ${cssVar.colorBorderSecondary};
  `,
  topBar: css`
    flex: none;
    block-size: 48px;
    border-block-end: 1px solid ${cssVar.colorBorderSecondary};
    background: ${cssVar.colorBgLayout};
  `,
}));

/**
 * Skeleton of the agent-share profile (`/a/:slugOrId`): the product bar, the
 * agent's identity band, the metrics strip, and the sections below.
 *
 * Separate from {@link AgentShareVisitorSkeleton}: the profile and the
 * conversation are different shapes now, and a skeleton that no longer
 * matches its page reads as a layout jump on every arrival.
 *
 * Kept structural and synchronously importable — the real brand logo pulls
 * image and icon modules onto every route's first-screen import graph.
 */
const AgentShareProfileSkeleton = () => (
  <Flexbox aria-busy height={'100%'} style={{ overflow: 'hidden' }} width={'100%'}>
    <Flexbox
      horizontal
      align={'center'}
      className={styles.topBar}
      justify={'space-between'}
      paddingInline={12}
    >
      <SkeletonBar height={22} radius={cssVar.borderRadius} width={22} />
      <SkeletonBar height={26} radius={cssVar.borderRadius} width={26} />
    </Flexbox>

    <Flexbox className={styles.band} paddingBlock={28} paddingInline={24}>
      <Flexbox className={styles.body} gap={20}>
        <SkeletonBar height={22} width={180} />
        <Flexbox horizontal gap={16}>
          <SkeletonBar height={64} radius={cssVar.borderRadiusLG} width={64} />
          <Flexbox gap={8} paddingBlock={6}>
            <SkeletonBar height={24} width={200} />
            <SkeletonBar height={14} width={120} />
          </Flexbox>
        </Flexbox>
        <Flexbox gap={8}>
          <SkeletonBar height={14} width={'90%'} />
          <SkeletonBar height={14} width={'70%'} />
        </Flexbox>
        <SkeletonBar height={40} radius={cssVar.borderRadiusLG} width={160} />
      </Flexbox>
    </Flexbox>

    <Flexbox className={styles.body} paddingInline={24}>
      <Flexbox horizontal className={styles.metrics} gap={24} paddingBlock={18}>
        {[0, 1, 2, 3, 4].map((index) => (
          <Flexbox align={'center'} flex={1} gap={6} key={index}>
            <SkeletonBar height={12} width={56} />
            <SkeletonBar height={20} width={40} />
          </Flexbox>
        ))}
      </Flexbox>
      <Flexbox gap={12} paddingBlock={32}>
        <SkeletonBar height={18} width={160} />
        <SkeletonBar height={14} width={'60%'} />
        <SkeletonBar height={14} width={'70%'} />
        <SkeletonBar height={14} width={'50%'} />
      </Flexbox>
    </Flexbox>
  </Flexbox>
);

export default AgentShareProfileSkeleton;
