'use client';

import { Button, Modal, Text } from '@lobehub/ui';
import { Table } from 'antd';
import { createStyles } from 'antd-style';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ImportPgDataStructure } from '@/types/export';

const getNonEmptyTables = (data: ImportPgDataStructure) => {
  const result = [];

  for (const [key, value] of Object.entries(data.data)) {
    if (Array.isArray(value) && value.length > 0) {
      result.push({
        count: value.length,
        name: key,
      });
    }
  }

  return result;
};

const getTotalRecords = (tables: { count: number; name: string }[]): number => {
  return tables.reduce((sum, table) => sum + table.count, 0);
};

const useStyles = createStyles(({ token, css }) => {
  return {
    duplicateAlert: css`
      margin-block-start: ${token.marginMD}px;
      padding: ${token.paddingMD}px;
      border: 1px solid ${token.colorWarningBorder};
      border-radius: ${token.borderRadiusLG}px;

      background-color: ${token.colorWarningBg};
    `,
    duplicateDescription: css`
      margin-block-start: ${token.marginXS}px;
      font-size: ${token.fontSizeSM}px;
      color: ${token.colorTextSecondary};
    `,
    duplicateOptions: css`
      margin-block-start: ${token.marginSM}px;
    `,
    duplicateTag: css`
      border-color: ${token.colorWarningBorder};
      color: ${token.colorWarning};
      background-color: ${token.colorWarningBg};
    `,
    hash: css`
      font-family: ${token.fontFamilyCode};
      font-size: 12px;
      color: ${token.colorTextTertiary};
    `,
    infoIcon: css`
      color: ${token.colorTextSecondary};
    `,
    modalContent: css`
      padding-block: ${token.paddingMD}px;
      padding-inline: 0;
    `,
    successIcon: css`
      color: ${token.colorSuccess};
    `,
    tableContainer: css`
      overflow: hidden;
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadiusLG}px;
    `,
    tableName: css`
      font-family: ${token.fontFamilyCode};
    `,
    warningIcon: css`
      color: ${token.colorWarning};
    `,
  };
});

interface ImportPreviewModalProps {
  importData: ImportPgDataStructure;
  onCancel?: () => void;
  onConfirm?: (overwriteExisting: boolean) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const ImportPreviewModal = ({
  open = true,
  onOpenChange = () => {},
  onConfirm = () => {},
  onCancel = () => {},
  importData,
}: ImportPreviewModalProps) => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();
  const [duplicateAction] = useState<string>('skip');
  const tables = getNonEmptyTables(importData);
  const totalRecords = getTotalRecords(tables);

  // 表格列定义
  const columns = [
    {
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <div className={styles.tableName}>{text}</div>,
      title: t('importPreview.tables.name'),
    },
    {
      dataIndex: 'count',
      key: 'count',
      title: t('importPreview.tables.count'),
    },
  ];

  const handleConfirm = () => {
    onConfirm(duplicateAction === 'overwrite');
    onOpenChange(false);
  };

  return (
    <Modal
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            onOpenChange(false);
            onCancel();
          }}
        >
          {t('cancel')}
        </Button>,
        <Button key="confirm" onClick={handleConfirm} type="primary">
          {t('importPreview.confirmImport')}
        </Button>,
      ]}
      onCancel={() => onOpenChange(false)}
      open={open}
      title={t('importPreview.title')}
      width={700}
    >
      <div className={styles.modalContent}>
        <Flexbox gap={16}>
          <Flexbox gap={4}>
            <Flexbox align="center" horizontal justify="space-between" width="100%">
              <Flexbox align="center" gap={8} horizontal>
                <Info className={styles.infoIcon} size={16} />
                <Text strong>{t('importPreview.totalRecords', { count: totalRecords })}</Text>
              </Flexbox>
              <Flexbox horizontal>
                <Text type="secondary">
                  {t('importPreview.totalTables', { count: tables.length })}
                </Text>
              </Flexbox>
            </Flexbox>
            <Flexbox className={styles.hash} gap={4} horizontal>
              Hash: <span>{importData.schemaHash}</span>
            </Flexbox>
          </Flexbox>

          <div className={styles.tableContainer}>
            <Table
              columns={columns}
              dataSource={tables}
              pagination={false}
              rowKey="name"
              scroll={{ y: 350 }}
              size="small"
            />
          </div>

          {/*<Flexbox>*/}
          {/*  重复数据处理方式：*/}
          {/*  <div className={styles.duplicateOptions}>*/}
          {/*    <Radio.Group*/}
          {/*      onChange={(e) => setDuplicateAction(e.target.value)}*/}
          {/*      value={duplicateAction}*/}
          {/*    >*/}
          {/*      <Space>*/}
          {/*        <Radio value="skip">跳过</Radio>*/}
          {/*        <Radio value="overwrite">覆盖</Radio>*/}
          {/*      </Space>*/}
          {/*    </Radio.Group>*/}
          {/*  </div>*/}
          {/*  <div className={styles.duplicateDescription}>*/}
          {/*    {duplicateAction === 'skip'*/}
          {/*      ? '选择跳过将仅导入不重复的数据，保留现有数据不变。'*/}
          {/*      : '选择覆盖将使用导入数据替换系统中具有相同 ID 的现有记录。'}*/}
          {/*  </div>*/}
          {/*</Flexbox>*/}
        </Flexbox>
      </div>
    </Modal>
  );
};

export default ImportPreviewModal;
