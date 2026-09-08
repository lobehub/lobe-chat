import { Button } from '@lobehub/ui/base-ui';
import type { Edge, EdgeProps } from '@xyflow/react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react';
import { createStaticStyles, cssVar, cx } from 'antd-style';

import { getFlowEdgeLabelLayout } from './flowEdgeLabel';

const styles = createStaticStyles(({ css }) => ({
  label: css`
    pointer-events: all;

    position: absolute;

    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

    max-width: 180px;
    height: auto;
    min-height: 0;
    max-height: 42px;
    padding-block: 3px;
    padding-inline: 2px;
    border-radius: 4px;

    font-size: 12px;
    line-height: 18px;
    color: ${cssVar.colorTextSecondary};
    overflow-wrap: anywhere;
    white-space: normal;

    background: ${cssVar.colorBgContainer};
  `,
}));

type TransitionEdge = Edge<{ onSelect: (id: string) => void; laneOffset?: number }>;

/** Labels share the graph scale so zooming out preserves their spacing. */
export function FlowEdge(props: EdgeProps<TransitionEdge>) {
  const lane = props.data?.laneOffset ?? 0;
  const [path, labelX, labelY] = lane
    ? ([
        `M ${props.sourceX},${props.sourceY} C ${props.sourceX + (props.targetX - props.sourceX) / 3},${props.sourceY + lane} ${props.targetX - (props.targetX - props.sourceX) / 3},${props.targetY + lane} ${props.targetX},${props.targetY}`,
        (props.sourceX + props.targetX) / 2,
        (props.sourceY + props.targetY) / 2 + lane * 0.75,
      ] as const)
    : getSmoothStepPath({ ...props, borderRadius: 20, offset: 32 });
  const label = getFlowEdgeLabelLayout({ ...props, lane, labelX, labelY });
  return (
    <>
      <BaseEdge id={props.id} markerEnd={props.markerEnd} path={path} style={props.style} />
      <EdgeLabelRenderer>
        <Button
          className={cx(styles.label, 'nodrag', 'nopan')}
          size="small"
          title={typeof props.label === 'string' ? props.label : undefined}
          type="text"
          style={{
            maxWidth: label.maxWidth,
            transform: `translate(-50%, -50%) translate(${label.x}px, ${label.y}px)`,
          }}
          onClick={() => props.data?.onSelect(props.id)}
        >
          {props.label}
        </Button>
      </EdgeLabelRenderer>
    </>
  );
}
