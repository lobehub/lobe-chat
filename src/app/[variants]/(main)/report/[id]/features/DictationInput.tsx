'use client';

import { AudioOutlined, ClearOutlined, SaveOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Input, Select, Space, message } from 'antd';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

const { TextArea } = Input;

interface DictationInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
}

const DictationInput = ({ value, onChange, onGenerate }: DictationInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('irm-cerebrale');

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      message.info('Recording started... (Whisper integration pending)');

      // TODO: Implement actual microphone recording
      // 1. Request microphone permission
      // 2. Start recording audio
      // 3. Send to Whisper API
      // 4. Display transcription in real-time

      // Mock recording for now
      setTimeout(() => {
        handleStopRecording();
      }, 3000);
    } catch (error) {
      console.error('Recording error:', error);
      message.error('Failed to start recording');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    message.success('Recording stopped');

    // TODO: Process audio and get transcription
  };

  const handleClear = () => {
    onChange('');
  };

  const handleSaveDraft = () => {
    message.success('Draft saved');
    // TODO: Save to database
  };

  return (
    <Flexbox gap={16}>
      {/* Template Selector */}
      <Flexbox horizontal gap={8} align="center">
        <span>Template:</span>
        <Select
          value={selectedTemplate}
          onChange={setSelectedTemplate}
          style={{ width: 300 }}
          options={[
            { label: 'IRM Cérébrale (Brain MRI)', value: 'irm-cerebrale' },
            { label: 'TDM Thoracique (Chest CT)', value: 'tdm-thorax' },
            { label: 'Échographie Abdominale (Abdominal US)', value: 'echo-abdomen' },
            { label: 'Radiographie Thorax (Chest X-Ray)', value: 'xr-thorax' },
          ]}
        />
      </Flexbox>

      {/* Text Input Area */}
      <TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your findings here or use the microphone button to dictate..."
        rows={10}
        style={{ fontSize: 16 }}
      />

      {/* Action Buttons */}
      <Flexbox horizontal gap={8} justify="space-between">
        <Space>
          {!isRecording ? (
            <Button
              type="primary"
              danger
              icon={<AudioOutlined />}
              onClick={handleStartRecording}
              size="large"
            >
              Start Dictation
            </Button>
          ) : (
            <Button
              type="default"
              danger
              onClick={handleStopRecording}
              size="large"
            >
              ⏹ Stop Recording
            </Button>
          )}

          <Button
            icon={<ClearOutlined />}
            onClick={handleClear}
            disabled={!value}
          >
            Clear
          </Button>

          <Button
            icon={<SaveOutlined />}
            onClick={handleSaveDraft}
            disabled={!value}
          >
            Save Draft
          </Button>
        </Space>

        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={onGenerate}
          disabled={!value}
          size="large"
        >
          Generate Report with AI
        </Button>
      </Flexbox>

      {/* Status Info */}
      {isRecording && (
        <div style={{ color: '#ff4d4f', fontWeight: 500 }}>
          🔴 Recording... Speak clearly into your microphone
        </div>
      )}

      {value && (
        <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
          {value.length} characters • {value.split(/\s+/).filter(Boolean).length} words
        </div>
      )}
    </Flexbox>
  );
};

export default DictationInput;
