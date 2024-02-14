import { Upload } from 'antd';
import { useResponsive } from 'antd-style';
import { Feather, FileClock, HardDriveDownload, HardDriveUpload, Heart } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ABOUT, CHANGELOG, FEEDBACK } from '@/const/url';
import { useImportConfig } from '@/hooks/useImportConfig';
import { configService } from '@/services/config';
import { SettingsTabs } from '@/store/global/initialState';

import Item from '../../features/SettingList/Item';

interface ExtraListProps {
  activeTab?: SettingsTabs;
}
const ExtraList = memo<ExtraListProps>(({ activeTab }) => {
  const { t } = useTranslation('common');

  const { importConfig } = useImportConfig();
  const { mobile } = useResponsive();
  const items = [
    {
      icon: HardDriveDownload,
      label: t('export'),
      onClick: configService.exportAll,
      value: 'export',
    },
    {
      icon: Feather,
      label: t('feedback'),
      onClick: () => window.open(FEEDBACK, '__blank'),
      value: 'feedback',
    },
    {
      icon: FileClock,
      label: t('changelog'),
      onClick: () => window.open(CHANGELOG, '__blank'),
      value: 'changelog',
    },
    {
      icon: Heart,
      label: t('about'),
      onClick: () => window.open(ABOUT, '__blank'),
      value: 'about',
    },
  ];

  return (
    <>
      <Upload
        beforeUpload={(file) => {
          importConfig(file);

          return false;
        }}
        maxCount={1}
        showUploadList={false}
      >
        <Item icon={HardDriveUpload} label={t('import')} style={{ width: '100vw' }} />
      </Upload>
      {items.map(({ value, icon, label, onClick }) => (
        <div key={value} onClick={onClick}>
          <Item active={mobile ? false : activeTab === value} icon={icon} label={label} />
        </div>
      ))}
    </>
  );
});

export default ExtraList;
