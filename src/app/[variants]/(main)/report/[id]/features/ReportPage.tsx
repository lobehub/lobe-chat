'use client';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import PatientInfoCard from './PatientInfoCard';
import DictationInput from './DictationInput';
import ReportPreview from './ReportPreview';

interface ReportPageProps {
  patientId: string;
}

const ReportPage = ({ patientId }: ReportPageProps) => {
  const router = useRouter();
  const [dictationText, setDictationText] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');

  // Mock patient data - will be replaced with real data from database
  const mockPatient = {
    name: 'DUPONT Jean',
    id: patientId,
    age: 45,
    examType: 'IRM Cérébrale',
    examDate: '2025-11-05',
    referringDoctor: 'Dr. MARTIN',
  };

  const handleBackToWorklist = () => {
    router.push('/worklist');
  };

  const handleGenerateReport = async () => {
    // TODO: Implement AI report generation with RAG
    console.log('Generating report from dictation:', dictationText);

    // Mock generated report for now
    const mockReport = `CLINIQUE SERENVALE
123 Avenue de la Santé, 75001 Paris

COMPTE RENDU D'IRM CÉRÉBRALE

Patient: ${mockPatient.name}
Date: ${mockPatient.examDate}
Médecin référent: ${mockPatient.referringDoctor}

TECHNIQUE:
IRM cérébrale réalisée avec séquences T1, T2, FLAIR et diffusion.

RÉSULTATS:
${dictationText}

CONCLUSION:
Examen sans particularité notable.

Dr. [Votre Nom]
[Signature numérique]`;

    setGeneratedReport(mockReport);
  };

  return (
    <Flexbox
      gap={24}
      padding={24}
      style={{ height: '100%', overflow: 'auto' }}
    >
      {/* Back Button */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBackToWorklist}
        style={{ width: 'fit-content' }}
      >
        Back to Worklist
      </Button>

      {/* Patient Info */}
      <PatientInfoCard patient={mockPatient} />

      {/* Dictation Input */}
      <Card title="Dictation & Input" bordered={false}>
        <DictationInput
          value={dictationText}
          onChange={setDictationText}
          onGenerate={handleGenerateReport}
        />
      </Card>

      {/* Report Preview */}
      {generatedReport && (
        <Card title="Generated Report Preview" bordered={false}>
          <ReportPreview content={generatedReport} />
        </Card>
      )}
    </Flexbox>
  );
};

export default ReportPage;
