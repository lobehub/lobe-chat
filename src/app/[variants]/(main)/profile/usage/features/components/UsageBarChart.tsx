import { Divider, Typography } from 'antd'
import { Flexbox } from 'react-layout-kit';
import { BarChart, ChartTooltipFrame, ChartTooltipRow, type BarChartProps } from '@lobehub/charts';

export const UsageBarChart = ({ ...props }: BarChartProps) => (
    <BarChart
        {...props}
        customTooltip={({ active, payload, label, valueFormatter }) => {
            if (active && payload) {
                return (
                    <ChartTooltipFrame>
                        <Flexbox
                            horizontal
                            justify={'space-between'}
                            paddingBlock={8}
                            paddingInline={16}
                        >
                            <Typography.Paragraph ellipsis style={{ margin: 0 }}>
                                {label}
                            </Typography.Paragraph>
                            <span style={{ fontWeight: 'bold' }}>
                                {payload.reduce((acc: number, cur: any) => acc + cur.value, 0)}
                            </span>
                        </Flexbox>
                        <Divider style={{ margin: 0 }} />
                        <Flexbox
                            gap={4}
                            paddingBlock={8}
                            paddingInline={16}
                            style={{ flexDirection: 'column-reverse', marginTop: 4 }}
                        >
                            {payload.map(({ value, color, name }: any, idx: number) => (
                                typeof value === 'number' && value > 0 ?
                                    <ChartTooltipRow
                                        color={color}
                                        key={`id-${idx}`}
                                        name={name}
                                        value={(valueFormatter as any)?.(value)}
                                    /> : null
                            ))}
                        </Flexbox>
                    </ChartTooltipFrame>
                );
            }
            return null;
        }}
    />
)