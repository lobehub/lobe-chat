'use client';

import { EyeOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions } from 'antd';
import type { DescriptionsProps } from 'antd';

interface Patient {
  name: string;
  id: string;
  age: number;
  examType: string;
  examDate: string;
  referringDoctor: string;
}

interface PatientInfoCardProps {
  patient: Patient;
}

const PatientInfoCard = ({ patient }: PatientInfoCardProps) => {
  const handleLaunchWeasis = () => {
    console.log('Launching Weasis for patient:', patient.id);
    // TODO: Implement Weasis launcher
  };

  const items: DescriptionsProps['items'] = [
    {
      key: 'name',
      label: 'Patient Name',
      children: patient.name,
    },
    {
      key: 'id',
      label: 'Patient ID',
      children: patient.id,
    },
    {
      key: 'age',
      label: 'Age',
      children: `${patient.age} years`,
    },
    {
      key: 'examType',
      label: 'Exam Type',
      children: patient.examType,
    },
    {
      key: 'examDate',
      label: 'Exam Date',
      children: patient.examDate,
    },
    {
      key: 'referringDoctor',
      label: 'Referring Doctor',
      children: patient.referringDoctor,
    },
  ];

  return (
    <Card
      title="Patient Information"
      bordered={false}
      extra={
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={handleLaunchWeasis}
        >
          Launch Weasis Viewer
        </Button>
      }
    >
      <Descriptions items={items} column={3} bordered />
    </Card>
  );
};

export default PatientInfoCard;
