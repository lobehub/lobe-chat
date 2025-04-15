'use client';

import { Button, Icon } from '@lobehub/ui';
import { Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import { ChevronDownIcon, SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlexboxProps } from 'react-layout-kit';

import { isDeprecatedEdition } from '@/const/version';
import { DiscoverProviderItem } from '@/types/discover';

const useStyles = createStyles(({ css }) => ({
  button: css`
    button {
      width: 100%;
    }
  `,
}));

interface ProviderConfigProps extends FlexboxProps {
  data: DiscoverProviderItem;
  identifier: string;
}

const ProviderConfig = memo<ProviderConfigProps>(({ data, identifier }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('discover');

  const router = useRouter();
  const openSettings = () => {
    router.push(isDeprecatedEdition ? '/settings/llm' : `/settings/provider/${identifier}`);
  };

  const icon = <Icon icon={SquareArrowOutUpRight} size={16} />;

  const items = [
    data.meta?.url && {
      icon,
      key: 'officialSite',
      label: (
        <Link href={data.meta.url} target={'_blank'}>
          {t('providers.officialSite')}
        </Link>
      ),
    },
    data.meta?.modelsUrl && {
      icon,
      key: 'modelSite',
      label: (
        <Link href={data.meta.modelsUrl} target={'_blank'}>
          {t('providers.modelSite')}
        </Link>
      ),
    },
  ].filter(Boolean) as any;

  if (!items || items?.length === 0)
    return (
      <Button block size={'large'} style={{ flex: 1 }} type={'primary'}>
        {t('providers.config')}
      </Button>
    );

  return (
    <Dropdown.Button
      className={styles.button}
      icon={<Icon icon={ChevronDownIcon} />}
      menu={{ items }}
      onClick={openSettings}
      overlayStyle={{ minWidth: 267 }}
      size={'large'}
      style={{ flex: 1, width: 'unset' }}
      type={'primary'}
    >
      {t('providers.config')}
    </Dropdown.Button>
  );
});

export default ProviderConfig;
