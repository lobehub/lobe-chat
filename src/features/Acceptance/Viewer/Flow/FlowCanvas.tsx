import { Flexbox } from '@lobehub/ui';
import {
  Background,
  Controls,
  type Edge,
  type Node,
  type NodeTypes,
  ReactFlow,
  useReactFlow,
  type Viewport,
} from '@xyflow/react';
import { createStaticStyles, cssVar } from 'antd-style';
import { useEffect, useRef } from 'react';

import { useFitViewOnResize } from '@/features/AgentGoals/ProcessControl/Graph/useFitViewOnResize';
import { useSingleton } from '@/hooks/useSingleton';

import { FlowEdge } from './FlowEdge';
import type { FlowGraphData } from './flowGraph';

const edgeTypes = { transition: FlowEdge };

const fitOptions = { maxZoom: 1, padding: 0.08 };
const styles = createStaticStyles(({ css }) => ({
  canvas: css`
    overflow: hidden;
    flex: none;

    width: 100%;
    min-width: 320px;
    height: clamp(520px, calc(100dvh - 400px), 900px);
    border-radius: ${cssVar.borderRadiusLG};

    background: transparent;

    .react-flow__edgelabel-renderer {
      z-index: 5;
    }

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
  viewKey,
}: {
  nodes: Node<FlowGraphData>[];
  edges: Edge[];
  nodeTypes: NodeTypes;
  onSelect: (id: string) => void;
  viewKey: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { fitView, getViewport, setViewport } = useReactFlow();
  const viewports = useSingleton(
    () => new Map<string, { viewport: Viewport; width: number; height: number }>(),
  );
  useFitViewOnResize(ref, fitView, fitOptions);
  useEffect(() => {
    const container = ref.current;
    const frame = requestAnimationFrame(() => {
      const saved = viewports.get(viewKey);
      if (
        saved &&
        saved.width === container?.clientWidth &&
        saved.height === container?.clientHeight
      )
        void setViewport(saved.viewport);
      else void fitView(fitOptions);
    });
    return () => {
      cancelAnimationFrame(frame);
      viewports.set(viewKey, {
        viewport: getViewport(),
        width: container?.clientWidth ?? 0,
        height: container?.clientHeight ?? 0,
      });
    };
  }, [viewKey, fitView, getViewport, setViewport, viewports]);
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
        minZoom={0.08}
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
