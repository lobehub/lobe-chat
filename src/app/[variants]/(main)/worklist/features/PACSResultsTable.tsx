'use client';

import { PlayCircleOutlined } from '@ant-design/icons';
import { Button, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';

interface PACSResult {
  key: string;
  patientName: string;
  patientId: string;
  examDate: string;
  examType: string;
  status: 'pending' | 'in-progress';
}

// Mock data - will be replaced with real PACS data later
const mockData: PACSResult[] = [
  {
    key: '1',
    patientName: 'DUPONT Jean',
    patientId: '123456',
    examDate: '2025-11-05',
    examType: 'IRM',
    status: 'pending',
  },
  {
    key: '2',
    patientName: 'MARTIN Sophie',
    patientId: '789012',
    examDate: '2025-11-05',
    examType: 'TDM',
    status: 'pending',
  },
  {
    key: '3',
    patientName: 'BERNARD Paul',
    patientId: '345678',
    examDate: '2025-11-04',
    examType: 'ECHO',
    status: 'pending',
  },
];

const PACSResultsTable = () => {
  const router = useRouter();

  const handleStartReport = (record: PACSResult) => {
    router.push(`/report/${record.patientId}`);
  };

  const columns: ColumnsType<PACSResult> = [
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
      title: 'Exam Date',
      dataIndex: 'examDate',
      key: 'examDate',
      sorter: (a, b) => a.examDate.localeCompare(b.examDate),
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
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={() => handleStartReport(record)}
        >
          Start Report
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={mockData}
      pagination={{ pageSize: 10 }}
      locale={{
        emptyText: 'No pending exams. Use the query form above to search PACS.',
      }}
    />
  );
};

export default PACSResultsTable;
