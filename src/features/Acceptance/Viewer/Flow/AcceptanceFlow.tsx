'use client';

import '@xyflow/react/dist/style.css';

import { Empty, Flexbox } from '@lobehub/ui';
import { Button, Select, Text } from '@lobehub/ui/base-ui';
import { MarkerType, ReactFlowProvider } from '@xyflow/react';
import { createStaticStyles, cssVar, useResponsive } from 'antd-style';
import { use, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { useAcceptanceScope } from '../AcceptanceScope';
import { acceptanceContentLayout } from '../layout';
import { AcceptancePlanReview } from '../Plan/AcceptancePlanReview';
import { useAcceptanceBundle } from '../useAcceptanceBundle';
import { FlowCanvas } from './FlowCanvas';
import { buildFlowGraph } from './flowGraph';
import { FlowGroup } from './FlowGroup';
import { getFlowRoundViews } from './flowNavigation';
import { FlowNode } from './FlowNode';
import { FlowOutline } from './FlowOutline';
import { FlowPanelHostContext } from './FlowPanelHost';
import { FlowResults } from './FlowResults';

const styles = createStaticStyles(({ css }) => ({
  toolbar: css`
    width: 100%;
    max-width: ${acceptanceContentLayout.maxWidth - 2 * acceptanceContentLayout.paddingInline}px;
    margin-inline: auto;
  `,
}));
const nodeTypes = { state: FlowNode, flowGroup: FlowGroup };

export function AcceptanceFlow() {
  const { t } = useTranslation('verify');
  const panelHost = use(FlowPanelHostContext);
  const { md = true } = useResponsive();
  const [display, setDisplay] = useState<'graph' | 'outline'>();
  const showOutline = (display ?? (md ? 'graph' : 'outline')) === 'outline';
  const { acceptanceId } = useAcceptanceScope();
  const { data, mutate } = useAcceptanceBundle(acceptanceId);
  const [roundKey, setRoundKey] = useState<string>();
  const [selected, setSelected] = useState<string>();
  const [focus, setFocus] = useState<string>();
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const views = getFlowRoundViews(data?.flows, data?.rounds);
  const keys = [
    ...new Set(
      views.map((view) => (view.roundIndex == null ? 'pending' : String(view.roundIndex))),
    ),
  ];
  const activeKey = keys.includes(roundKey ?? '') ? roundKey! : keys[0];
  const candidates = views.filter(
    (view) => (view.roundIndex == null ? 'pending' : String(view.roundIndex)) === activeKey,
  );
  const referenced = new Set(
    candidates.flatMap((view) =>
      view.version.nodes.flatMap((node) => (node.subFlowId ? [node.subFlowId] : [])),
    ),
  );
  const roots = candidates.filter((view) => !referenced.has(view.version.flowId));
  const visibleViews = roots.length ? roots : candidates;
  const graph = buildFlowGraph(
    visibleViews,
    collapsed,
    selected,
    (id) => {
      setCollapsed((previous) => {
        const next = new Set(previous);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    setFocus,
    setSelected,
    focus,
  );
  if (!views.length) return <Empty description={t('flow.empty')} />;
  const edgeSelection = graph.transitions.get(selected ?? '');
  const checkSelection =
    graph.checks.get(selected ?? '') ??
    (edgeSelection
      ? [...graph.checks.values()].find(
          (item) =>
            item.view.id === edgeSelection.view.id &&
            item.node.id === edgeSelection.edge.targetNodeKey,
        )
      : undefined);
  const attempts = (checkSelection?.view.run?.attempts ?? []).filter(
    (a) =>
      a.nodeId === checkSelection?.node.id &&
      (!edgeSelection || a.incomingEdgeId === edgeSelection.edge.id),
  );
  const crumbs: { id: string; title: string }[] = [];
  for (let id = focus; id && graph.groups.has(id); id = graph.groups.get(id)?.parent)
    crumbs.unshift({ id, title: graph.groups.get(id)!.title });
  const graphEdges = graph.edges.map((edge) => ({
    ...edge,
    markerEnd: { type: MarkerType.Arrow, color: cssVar.colorTextQuaternary, width: 16, height: 16 },
    style: {
      stroke: edge.id === selected ? cssVar.colorPrimary : cssVar.colorTextQuaternary,
      strokeWidth: edge.id === selected ? 2 : 1.5,
    },
  }));
  return (
    <Flexbox gap={16}>
      <Flexbox
        horizontal
        align="center"
        className={styles.toolbar}
        gap={8}
        justify="space-between"
        wrap="wrap"
      >
        <Flexbox horizontal align="center" gap={4}>
          <Button size="small" type="text" onClick={() => setFocus(undefined)}>
            {t('flow.allGroups')}
          </Button>
          {crumbs.map((crumb) => (
            <Flexbox horizontal align="center" gap={4} key={crumb.id}>
              <Text type="secondary">/</Text>
              <Button size="small" type="text" onClick={() => setFocus(crumb.id)}>
                {crumb.title}
              </Button>
            </Flexbox>
          ))}
        </Flexbox>
        <Flexbox horizontal align="center" gap={8}>
          <AcceptancePlanReview runId={candidates[0]?.run?.verifyRunId} />
          <Button
            size="small"
            type="text"
            onClick={() => setDisplay(showOutline ? 'graph' : 'outline')}
          >
            {t(showOutline ? 'flow.graphView' : 'flow.outlineView')}
          </Button>
          <Select
            size="small"
            style={{ width: 120, flexShrink: 0 }}
            value={activeKey}
            options={keys.map((key) => ({
              value: key,
              label:
                key === 'pending'
                  ? t('flow.pendingPlan')
                  : t('acceptance.round', { round: Number(key) }),
            }))}
            onChange={(value: string) => {
              setRoundKey(value);
              setFocus(undefined);
              setSelected(undefined);
            }}
          />
        </Flexbox>
      </Flexbox>
      {showOutline ? (
        <FlowOutline edges={graphEdges} nodes={graph.nodes} onSelect={setSelected} />
      ) : (
        <ReactFlowProvider key={activeKey}>
          <FlowCanvas
            edges={graphEdges}
            nodeTypes={nodeTypes}
            nodes={graph.nodes}
            viewKey={focus ?? activeKey}
            onSelect={setSelected}
          />
        </ReactFlowProvider>
      )}
      {checkSelection &&
        panelHost &&
        createPortal(
          <FlowResults
            acceptanceId={acceptanceId!}
            attempts={attempts}
            edges={checkSelection.view.version.edges}
            key={`${checkSelection.view.id}:${selected}`}
            node={checkSelection.node}
            selectedEdge={edgeSelection?.edge}
            canReview={Boolean(
              data?.canReview &&
              checkSelection.view.roundIndex != null &&
              checkSelection.view.roundIndex ===
                Math.max(...(data?.rounds.map((r) => r.run.roundIndex ?? 0) ?? [0])),
            )}
            onClose={() => setSelected(undefined)}
            onSaved={mutate}
          />,
          panelHost,
        )}
    </Flexbox>
  );
}
