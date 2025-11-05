'use client';

import { EyeOutlined, FilePdfOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Button, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';

interface FinishedReport {
  key: string;
  patientName: string;
  patientId: string;
  reportDate: string;
  examType: string;
  status: 'completed';
}

// Mock data - will be replaced with real database data later
const mockData: FinishedReport[] = [
  {
    key: '1',
    patientName: 'LEGRAND Marie',
    patientId: '567890',
    reportDate: '2025-11-05',
    examType: 'IRM',
    status: 'completed',
  },
  {
    key: '2',
    patientName: 'DUBOIS Pierre',
    patientId: '234567',
    reportDate: '2025-11-04',
    examType: 'TDM',
    status: 'completed',
  },
];

const FinishedReportsTable = () => {
  const router = useRouter();

  const handleViewReport = (record: FinishedReport) => {
    router.push(`/report/${record.patientId}`);
  };

  const handleExportPDF = (record: FinishedReport) => {
    console.log('Export PDF for:', record.patientId);
    // TODO: Implement PDF export logic
  };

  const columns: ColumnsType<FinishedReport> = [
    {
      title: '',
      key: 'status',
      width: 50,
      render: () => (
        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
      ),
    },
    {
      title: 'Patient Name',
      dataIndex: 'patientName',
      key: 'patientName',
      sorter: (a, b) => a.patientName.localeCompare(b.patientName),
    },
    {
      title: 'Patient ID',
      dataIndex: 'patientId',
      key: 'patientId',
    },
    {
      title: 'Report Date',
      dataIndex: 'reportDate',
      key: 'reportDate',
      sorter: (a, b) => a.reportDate.localeCompare(b.reportDate),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Exam Type',
      dataIndex: 'examType',
      key: 'examType',
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          'IRM': 'blue',
          'TDM': 'green',
          'ECHO': 'orange',
          'XR': 'purple',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewReport(record)}
          >
            View
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            onClick={() => handleExportPDF(record)}
          >
            PDF
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={mockData}
      pagination={{ pageSize: 10 }}
      locale={{
        emptyText: 'No finished reports yet.',
      }}
    />
  );
};

export default FinishedReportsTable;
