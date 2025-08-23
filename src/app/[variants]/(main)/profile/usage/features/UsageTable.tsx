import { memo, useEffect } from 'react';
import { useTheme } from 'antd-style';
import { Table, TableColumnType, Typography } from 'antd';
import { parseAsInteger, useQueryState } from 'nuqs'
import { ProviderIcon } from '@lobehub/icons'

import { usageService } from '@/services/usage';

import { UsageChartProps } from '../Client'
import { useClientDataSWR } from '@/libs/swr';
import { Flexbox } from 'react-layout-kit';
import { Tag } from '@lobehub/ui';
import { formatDate, formatNumber } from '@/utils/format';

const UsageTable = memo<UsageChartProps>(({ dateStrings }) => {
    const theme = useTheme();

    const { data, isLoading, mutate } = useClientDataSWR('usage-logs', async () =>
        usageService.findByMonth(dateStrings),
    );

    const [currentPage, setCurrentPage] = useQueryState(
        'current',
        parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
    );
    const [pageSize, setPageSize] = useQueryState(
        'pageSize',
        parseAsInteger.withDefault(5).withOptions({ clearOnDefault: true }),
    );

    useEffect(() => {
        if (dateStrings) {
            mutate();
        }
    }, [dateStrings]);

    const columns: TableColumnType<any>[] = [
        {
            key: 'id',
            title: 'ID',
            hidden: true,
        },
        {
            key: 'model',
            title: 'Model',
            dataIndex: 'model',
            render: (value, record) => (
                <Flexbox align={'start'} gap={16} horizontal>
                    <ProviderIcon
                        provider={record.provider}
                        style={{
                            border: `2px solid ${theme.colorBgContainer}`,
                            boxSizing: 'content-box',
                            marginRight: -8,
                        }}
                        size={18}
                    />
                    <Typography.Text>
                        {value?.length > 12 ? `${value.slice(0, 12)}...` : value}
                    </Typography.Text>
                </Flexbox>
            )
        },
        {
            key: 'callType',
            title: 'Call Type',
            dataIndex: 'callType',
            render: (value) => {
                return <Tag>{value}</Tag>
            },
            filters: [
                {
                    text: 'Chat',
                    value: 'chat',
                },
                {
                    text: 'Tool',
                    value: 'tool',
                }
            ],
            onFilter: (value, record) => record.callType === value,
        },
        {
            key: 'inputTokens',
            title: 'Input Tokens',
            dataIndex: 'totalInputTokens',
        },
        {
            key: 'outputTokens',
            title: 'Output Tokens',
            dataIndex: 'totalOutputTokens',
        },
        {
            key: 'tps',
            title: 'TPS',
            dataIndex: 'tps',
            render: (value) => formatNumber(value, 2),
        },
        {
            key: 'ttft',
            title: 'TTFT',
            dataIndex: 'ttft',
            render: (value) => formatNumber(value / 1000, 2),
        },
        {
            key: 'spend',
            title: 'Spend',
            dataIndex: 'spend',
            render: (value) => {
                return `$${formatNumber(value / 1000_000, 6)}`;
            }
        },
        {
            key: 'createdAt',
            title: 'Created At',
            dataIndex: 'createdAt',
            render: (value) => {
                return formatDate(new Date(value))
            },
            sorter: (a, b) => a.createdAt - b.createdAt,
            sortDirections: ['descend'],
        },
    ]

    return (
        <Table
            columns={columns}
            dataSource={data}
            key='id'
            size='small'
            loading={isLoading}
            pagination={{
                current: currentPage,
                onChange: (page) => {
                    setCurrentPage(page);
                },
                onShowSizeChange: (current, size) => {
                    setCurrentPage(current);
                    setPageSize(size);
                },
                pageSize,
            }}
        />
    );
})

export default UsageTable;