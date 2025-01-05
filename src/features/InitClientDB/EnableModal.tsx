import { Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { CpuIcon, LibraryBig, ShieldCheck } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import DataStyleModal from '@/components/DataStyleModal';
import { useGlobalStore } from '@/store/global';

import { PGliteSVG } from './PGliteSVG';

const useStyles = createStyles(({ css, token, isDarkMode, responsive }) => ({
  desc: css`
    width: 280px;
    color: ${token.colorTextSecondary};

    ${responsive.mobile} {
      line-height: ${token.lineHeight};
    }
  `,
  hint: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextTertiary};
    text-align: center;
  `,
  icon: css`
    color: ${isDarkMode ? token.blue : token.geekblue};
  `,
  iconCtn: css`
    width: 72px;
    height: 72px;
    background: ${isDarkMode ? token.blue1 : token.geekblue1};
    border-radius: 50%;
  `,
  intro: css`
    ${responsive.mobile} {
      width: 350px;
      margin-block-start: 24px;
      line-height: ${token.lineHeight};
    }
  `,

  title: css`
    margin-block-end: 0;
    font-size: ${token.fontSizeLG}px;
    font-weight: bold;
  `,
}));

interface EnableClientDBModalProps {
  open: boolean;
}

const EnableClientDBModal = memo<EnableClientDBModalProps>(({ open }) => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();
  const markPgliteEnabled = useGlobalStore((s) => s.markPgliteEnabled);
  const features = [
    {
      avatar: PGliteSVG,
      desc: t('clientDB.modal.features.pglite.desc'),
      title: t('clientDB.modal.features.pglite.title'),
    },
    {
      avatar: ShieldCheck,
      desc: t('clientDB.modal.features.localFirst.desc'),
      title: t('clientDB.modal.features.localFirst.title'),
    },
    {
      avatar: LibraryBig,
      desc: t('clientDB.modal.features.knowledgeBase.desc'),
      title: t('clientDB.modal.features.knowledgeBase.title'),
    },
  ];

  return (
    <DataStyleModal icon={CpuIcon} open={open} title={t('clientDB.modal.title')}>
      <Center gap={48}>
        <Flexbox>
          <Flexbox className={styles.intro} style={{ textAlign: 'center' }} width={460}>
            {t('clientDB.modal.desc')}
          </Flexbox>
        </Flexbox>
        <Flexbox gap={32}>
          {features.map((item) => (
            <Flexbox align={'flex-start'} gap={24} horizontal key={item.title}>
              <Center className={styles.iconCtn}>
                <Icon className={styles.icon} icon={item.avatar} size={{ fontSize: 36 }} />
              </Center>
              <Flexbox gap={8}>
                <p className={styles.title}>{item.title}</p>
                <p className={styles.desc}>{item.desc}</p>
              </Flexbox>
            </Flexbox>
          ))}
        </Flexbox>
        <Flexbox align={'center'} gap={16} style={{ paddingBottom: 16 }}>
          <Flexbox gap={16} horizontal justify={'center'} style={{ flexWrap: 'wrap' }}>
            <Button onClick={markPgliteEnabled} size={'large'} type={'primary'}>
              {t('clientDB.modal.enable')}
            </Button>
          </Flexbox>
        </Flexbox>
      </Center>
    </DataStyleModal>
  );
});

export default EnableClientDBModal;
