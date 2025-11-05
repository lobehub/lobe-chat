'use client';

import { EditOutlined, FilePdfOutlined, PrinterOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Space, message } from 'antd';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

interface ReportPreviewProps {
  content: string;
}

const ReportPreview = ({ content }: ReportPreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    message.success('Report saved to database');
    setIsEditing(false);
    // TODO: Save to database
  };

  const handleExportPDF = () => {
    message.success('Exporting to PDF...');
    // TODO: Implement PDF export
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Flexbox gap={16}>
      {/* Action Buttons */}
      <Flexbox horizontal gap={8} justify="flex-end">
        <Space>
          {!isEditing ? (
            <Button icon={<EditOutlined />} onClick={handleEdit}>
              Edit Report
            </Button>
          ) : (
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              Save Changes
            </Button>
          )}

          <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>
            Export PDF
          </Button>

          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            Print
          </Button>
        </Space>
      </Flexbox>

      {/* Report Content */}
      <div
        style={{
          border: '1px solid #d9d9d9',
          borderRadius: 8,
          padding: 32,
          backgroundColor: '#fff',
          minHeight: 600,
          fontFamily: 'Georgia, serif',
        }}
      >
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: 600,
              border: 'none',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'Georgia, serif',
              fontSize: 14,
              lineHeight: 1.8,
            }}
          />
        ) : (
          <pre
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 14,
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}
          >
            {editedContent}
          </pre>
        )}
      </div>
    </Flexbox>
  );
};

export default ReportPreview;
