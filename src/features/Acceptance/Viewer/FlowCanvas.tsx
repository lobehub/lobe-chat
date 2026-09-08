import { Flexbox } from '@lobehub/ui';
import {
  Background,
  Controls,
  type Edge,
  type Node,
  type NodeTypes,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import { createStaticStyles, cssVar } from 'antd-style';
import { useRef } from 'react';

import { useFitViewOnResize } from '@/features/AgentGoals/ProcessControl/Graph/useFitViewOnResize';

import { FlowEdge } from './FlowEdge';
import type { FlowNodeData } from './FlowNode';

const edgeTypes = { transition: FlowEdge };

const fitOptions = { maxZoom: 1, padding: 0.08 };
const styles = createStaticStyles(({ css }) => ({
  canvas: css`
    overflow: hidden;
    flex: 1 1 520px;

    min-width: 320px;
    height: 360px;
    border-radius: ${cssVar.borderRadiusLG};

    background: transparent;

    .react-flow__controls-button {
      border-color: ${cssVar.colorBorderSecondary};
      background: ${cssVar.colorBgContainer};
      fill: ${cssVar.colorTextSecondary};
    }
  `,
}));

export function FlowCanvas({
  nodes,
  edges,
  nodeTypes,
  onSelect,
}: {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  nodeTypes: NodeTypes;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();
  useFitViewOnResize(ref, fitView, fitOptions);
  return (
    <Flexbox className={styles.canvas} ref={ref}>
      <ReactFlow
        fitView
        panOnDrag
        panOnScroll
        preventScrolling
        zoomOnDoubleClick
        zoomOnPinch
        colorMode="system"
        edgeTypes={edgeTypes}
        edges={edges}
        fitViewOptions={fitOptions}
        maxZoom={1.5}
        minZoom={0.25}
        nodeTypes={nodeTypes}
        nodes={nodes}
        nodesConnectable={false}
        nodesDraggable={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
        zoomOnScroll={false}
        onEdgeClick={(_, e) => onSelect(e.id)}
        onNodeClick={(_, n) => onSelect(n.id)}
      >
        <Background bgColor="transparent" color={cssVar.colorBorderSecondary} gap={18} size={1} />
        <Controls position="bottom-right" showInteractive={false} />
      </ReactFlow>
    </Flexbox>
  );
}
