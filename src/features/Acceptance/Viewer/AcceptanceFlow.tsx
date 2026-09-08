'use client';

import '@xyflow/react/dist/style.css';

import { Empty, Flexbox, Icon } from '@lobehub/ui';
import { Select, Text } from '@lobehub/ui/base-ui';
import { MarkerType, Position, ReactFlowProvider } from '@xyflow/react';
import { createStaticStyles, cssVar } from 'antd-style';
import { Route } from 'lucide-react';
import { use, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { useAcceptanceScope } from './AcceptanceScope';
import { FlowCanvas } from './FlowCanvas';
import { getFlowRoundViews } from './flowNavigation';
import { FlowNode } from './FlowNode';
import { getFlowNodeState } from './flowNodeState';
import { FlowPanelHostContext, FlowResults } from './FlowResults';
import { acceptanceContentLayout } from './layout';
import { useAcceptanceBundle } from './useAcceptanceBundle';

const styles = createStaticStyles(({ css }) => ({
  toolbar: css`
    width: 100%;
    max-width: ${acceptanceContentLayout.maxWidth - 2 * acceptanceContentLayout.paddingInline}px;
    margin-inline: auto;
  `,
}));

const nodeTypes = { state: FlowNode };

/** State exploration owns its selection; the acceptance page owns only the tab. */
export function AcceptanceFlow() {
  const { t } = useTranslation('verify');
  const panelHost = use(FlowPanelHostContext);
  const { acceptanceId } = useAcceptanceScope();
  const { data, mutate } = useAcceptanceBundle(acceptanceId);
  const [viewId, setViewId] = useState<string>();
  const [selected, setSelected] = useState<string>();
  const views = getFlowRoundViews(data?.flows, data?.rounds);
  const view = views.find((item) => item.id === viewId) ?? views[0];
  if (!view) return <Empty description={t('flow.empty')} />;
  const { version, run } = view;
  const visits = run?.attempts ?? [];
  const latest = new Map(visits.map((a) => [a.incomingEdgeId ?? 'entry', a]));
  const selectedEdge = version.edges.find((e) => e.id === selected);
  const node = version.nodes.find(
    (n) => n.id === selected || (selectedEdge && n.nodeKey === selectedEdge.targetNodeKey),
  );
  const attempts = visits.filter(
    (a) => a.nodeId === node?.id && (!selectedEdge || a.incomingEdgeId === selectedEdge.id),
  );
  // Breadth-first columns preserve back edges without recursively expanding cycles.
  const depths = new Map([[version.entryNodeKey, 0]]);
  const queue = [version.entryNodeKey];
  for (let i = 0; i < queue.length; i++)
    for (const edge of version.edges.filter((e) => e.sourceNodeKey === queue[i])) {
      if (!depths.has(edge.targetNodeKey)) {
        depths.set(edge.targetNodeKey, depths.get(queue[i])! + 1);
        queue.push(edge.targetNodeKey);
      }
    }
  const rows = new Map<number, number>();
  const graphNodes = version.nodes.map((n) => {
    const depth = depths.get(n.nodeKey) ?? 0;
    const row = rows.get(depth) ?? 0;
    rows.set(depth, row + 1);
    const state = getFlowNodeState(
      n.nodeKey,
      version.entryNodeKey,
      version.edges,
      visits,
      n.entryRequired,
    );
    return {
      id: n.id,
      type: 'state',
      position: { x: depth * 400, y: row * 220 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        title: n.title,
        expected: n.expected,
        state,
        selected: n.id === node?.id,
        attempts: visits.filter((a) => a.nodeId === n.id).length,
        evidence: visits
          .filter((a) => a.nodeId === n.id)
          .flatMap((a) => a.evidence.filter((e) => e.fileUrl)).length,
      },
      width: 260,
    };
  });
  const graphEdges = version.edges.map((e) => ({
    id: e.id,
    source: version.nodes.find((n) => n.nodeKey === e.sourceNodeKey)!.id,
    target: version.nodes.find((n) => n.nodeKey === e.targetNodeKey)!.id,
    label: e.trigger,
    type: 'transition',
    data: {
      onSelect: setSelected,
      laneOffset: (() => {
        const peers = version.edges.filter(
          (other) =>
            other.sourceNodeKey === e.sourceNodeKey && other.targetNodeKey === e.targetNodeKey,
        );
        return (peers.findIndex((other) => other.id === e.id) - (peers.length - 1) / 2) * 64;
      })(),
    },
    sourceHandle:
      depths.get(e.targetNodeKey)! <= depths.get(e.sourceNodeKey)! ? 'return-out' : 'out',
    targetHandle: depths.get(e.targetNodeKey)! <= depths.get(e.sourceNodeKey)! ? 'return-in' : 'in',
    markerEnd: { type: MarkerType.Arrow, color: cssVar.colorTextQuaternary, width: 16, height: 16 },
    style: {
      stroke:
        e.id === selected
          ? cssVar.colorPrimary
          : latest.get(e.id)?.verdict === 'failed'
            ? cssVar.colorErrorBorder
            : cssVar.colorTextQuaternary,
      strokeWidth: e.id === selected ? 2 : 1.5,
    },
  }));

  return (
    <Flexbox gap={16}>
      <Flexbox className={styles.toolbar} gap={12}>
        <Flexbox horizontal align="center" gap={12} justify="space-between" wrap="wrap">
          <Flexbox horizontal align="center" gap={8}>
            <Icon icon={Route} size={18} style={{ color: cssVar.colorTextSecondary }} />
            <Text strong fontSize={15}>
              {version.title}
            </Text>
          </Flexbox>
          <Flexbox horizontal align="center" gap={12} style={{ marginInlineStart: 'auto' }}>
            <Select
              size="small"
              style={{ height: 34, minWidth: 110 }}
              value={view.id}
              variant="filled"
              options={views.map((item) => ({
                label: [
                  item.roundIndex == null
                    ? t('flow.pendingPlan')
                    : t('acceptance.round', { round: item.roundIndex }),
                  (data?.flows.length ?? 0) > 1 ? item.version.title : undefined,
                ]
                  .filter(Boolean)
                  .join(' · '),
                value: item.id,
              }))}
              onChange={(value: string) => {
                if (!value) return;
                setViewId(value);
                setSelected(undefined);
              }}
            />
          </Flexbox>
        </Flexbox>
      </Flexbox>
      <Flexbox horizontal align="stretch" gap={16} wrap="wrap">
        <ReactFlowProvider key={version.id}>
          <FlowCanvas
            edges={graphEdges}
            nodeTypes={nodeTypes}
            nodes={graphNodes}
            onSelect={setSelected}
          />
        </ReactFlowProvider>
        {node &&
          panelHost &&
          createPortal(
            <FlowResults
              acceptanceId={acceptanceId!}
              attempts={attempts}
              edges={version.edges}
              key={`${version.id}:${run?.id}:${selected}`}
              node={node}
              selectedEdge={selectedEdge}
              canReview={Boolean(
                data?.canReview &&
                view.roundIndex != null &&
                view.roundIndex ===
                  Math.max(...(data?.rounds.map((r) => r.run.roundIndex ?? 0) ?? [0])),
              )}
              onClose={() => setSelected(undefined)}
              onSaved={mutate}
            />,
            panelHost,
          )}
      </Flexbox>
    </Flexbox>
  );
}
