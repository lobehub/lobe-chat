'use client';

import { Button, Segmented } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { AlertCircle, ArrowLeft, PenToolIcon as Tool } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Backup from './Backup';
import Diagnosis from './Diagnosis';
import Repair from './Repair';

const useStyles = createStyles(({ css, token }) => ({
  backButton: css`
    margin-inline-end: ${token.marginSM}px;
    padding-block: 4px;
    padding-inline: 8px;
  `,
}));

enum DatabaseRepairTab {
  Backup = 'backup',
  Diagnosis = 'diagnosis',
  Repair = 'repair',
}

interface DatabaseRepairProps {
  setShowRepair: (value: boolean) => void;
}

const DatabaseRepair = memo<DatabaseRepairProps>(({ setShowRepair }) => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();
  const [activeTab, setActiveTab] = useState<DatabaseRepairTab>(DatabaseRepairTab.Diagnosis);

  return (
    <Flexbox gap={12}>
      <Flexbox horizontal justify={'space-between'}>
        <Button
          className={styles.backButton}
          icon={<ArrowLeft size={16} />}
          onClick={() => setShowRepair(false)}
          type="text"
        >
          {t('back')}
        </Button>
        <Segmented
          onChange={(v) => setActiveTab(v as DatabaseRepairTab)}
          options={[
            {
              label: (
                <Flexbox align={'center'} horizontal>
                  <AlertCircle size={16} style={{ marginRight: 8 }} />
                  {t('clientDB.solve.tabs.diagnosis')}
                </Flexbox>
              ),
              value: 'diagnosis',
            },
            {
              label: (
                <Flexbox align={'center'} horizontal>
                  <Tool size={16} style={{ marginRight: 8 }} />
                  {t('clientDB.solve.tabs.repair')}
                </Flexbox>
              ),
              value: 'repair',
            },
            // {
            //   label: (
            //     <Flexbox align={'center'} horizontal>
            //       <Shield size={16} style={{ marginRight: 8 }} />
            //       {t('clientDB.solve.tabs.backup')}
            //     </Flexbox>
            //   ),
            //   value: 'backup',
            // },
          ]}
          value={activeTab}
        />
        <Flexbox width={36} />
      </Flexbox>

      {activeTab === DatabaseRepairTab.Diagnosis && <Diagnosis />}
      {activeTab === DatabaseRepairTab.Repair && <Repair />}
      {activeTab === DatabaseRepairTab.Backup && <Backup />}
    </Flexbox>
  );
});

export default DatabaseRepair;
