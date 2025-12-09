import { Tag } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import urlJoin from 'url-join';

import { OFFICIAL_URL } from '@/const/url';
import { isDesktop } from '@/const/version';
import PlanIcon from '@/features/PlanIcon';
import { Plans } from '@/types/subscription';

export enum PlanType {
  Preview = 'preview',
}

export interface PlanTagProps {
  type?: PlanType | Plans;
}

const PlanTag = memo<PlanTagProps>(({ type = PlanType.Preview }) => {
  const { t } = useTranslation('common');
  const theme = useTheme();

  if (type === PlanType.Preview) {
    return (
      <Tag
        bordered={false}
        style={{ background: theme.colorFill, borderRadius: 12, cursor: 'pointer' }}
      >
        {t('userPanel.community')}
      </Tag>
    );
  }

  const isFree = type === Plans.Free;

  return (
    <Link
      style={{ cursor: 'pointer' }}
      target={isDesktop ? '_blank' : undefined}
      to={urlJoin(
        isDesktop ? OFFICIAL_URL : '/',
        isFree ? '/subscription/plans' : '/subscription/usage',
      )}
    >
      <PlanIcon plan={type} size={22} type={'tag'} />
    </Link>
  );
});

export default PlanTag;
