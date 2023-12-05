import { Upload } from 'antd';
import { useResponsive } from 'antd-style';
import { Feather, FileClock, HardDriveDownload, HardDriveUpload, Heart } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ABOUT, CHANGELOG, FEEDBACK } from '@/const/url';
import { useImportConfig } from '@/hooks/useImportConfig';
import { configService } from '@/services/config';
import { useGlobalStore } from '@/store/global';

import Item from '../../features/SideBar/Item';

const ExtraList = memo(() => {
  const { t } = useTranslation('common');

  const { importConfig } = useImportConfig();
  const tab = useGlobalStore((s) => s.settingsTab);
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
          <Item active={mobile ? false : tab === value} icon={icon} label={label} />
        </div>
      ))}
    </>
  );
});

export default ExtraList;
