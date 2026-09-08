import { Button } from '@lobehub/ui/base-ui';
import type { Edge, EdgeProps } from '@xyflow/react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useViewport } from '@xyflow/react';
import { createStaticStyles, cssVar, cx } from 'antd-style';

const styles = createStaticStyles(({ css }) => ({
  label: css`
    pointer-events: all;

    position: absolute;

    height: auto;
    min-height: 0;
    padding-block: 3px;
    padding-inline: 2px;
    border-radius: 4px;

    font-size: 12px;
    line-height: 18px;
    color: ${cssVar.colorTextSecondary};
    white-space: normal;

    background: ${cssVar.colorBgContainer};
  `,
}));

type TransitionEdge = Edge<{ onSelect: (id: string) => void; laneOffset?: number }>;

/** Keep branch labels readable when the map fits a wide graph into the viewport. */
export function FlowEdge(props: EdgeProps<TransitionEdge>) {
  const { zoom } = useViewport();
  const lane = props.data?.laneOffset ?? 0;
  const [path, labelX, labelY] = lane
    ? ([
        `M ${props.sourceX},${props.sourceY} C ${props.sourceX + (props.targetX - props.sourceX) / 3},${props.sourceY + lane} ${props.targetX - (props.targetX - props.sourceX) / 3},${props.targetY + lane} ${props.targetX},${props.targetY}`,
        (props.sourceX + props.targetX) / 2,
        (props.sourceY + props.targetY) / 2 + lane * 0.75,
      ] as const)
    : getSmoothStepPath({ ...props, borderRadius: 20, offset: 32 });
  return (
    <>
      <BaseEdge id={props.id} markerEnd={props.markerEnd} path={path} style={props.style} />
      <EdgeLabelRenderer>
        <Button
          className={cx(styles.label, 'nodrag', 'nopan')}
          size="small"
          type="text"
          style={{
            maxWidth:
              Math.abs(props.sourceY - props.targetY) < 24
                ? Math.max(40, Math.abs(props.targetX - props.sourceX) * zoom - 8)
                : undefined,
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px) scale(${1 / zoom})`,
          }}
          onClick={() => props.data?.onSelect(props.id)}
        >
          {props.label}
        </Button>
      </EdgeLabelRenderer>
    </>
  );
}
