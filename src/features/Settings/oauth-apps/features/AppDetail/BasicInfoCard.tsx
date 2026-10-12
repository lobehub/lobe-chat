'use client';

import { Flexbox } from '@lobehub/ui';
import { Button, Text } from '@lobehub/ui/base-ui';
import { PencilIcon } from 'lucide-react';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import { type OAuthAppItem, type UpdateOAuthAppParams } from '@/types/oauthApp';

import AppLogo from '../AppLogo';
import { openEditBasicInfoModal } from './EditBasicInfoModal';
import SectionCard from './SectionCard';

const LOGO_SIZE = 64;

interface BasicInfoCardProps {
  canEdit: boolean;
  detail: OAuthAppItem;
  onSubmit: (value: UpdateOAuthAppParams) => Promise<void>;
}

/**
 * Name, logo and description, read-only. Edit opens a modal with the form, so
 * the card never swaps its text for inputs in place.
 */
const BasicInfoCard: FC<BasicInfoCardProps> = ({ canEdit, detail, onSubmit }) => {
  const { t } = useTranslation('auth');

  return (
    <SectionCard
      title={t('oauthApp.detail.basicInfo')}
      extra={
        <Button
          disabled={!canEdit}
          icon={<PencilIcon size={14} />}
          size={'small'}
          onClick={() => openEditBasicInfoModal({ detail, onSubmit })}
        >
          {t('oauthApp.detail.edit')}
        </Button>
      }
    >
      <Flexbox horizontal align={'center'} gap={16}>
        <AppLogo logoUri={detail.logoUri} name={detail.name} size={LOGO_SIZE} />
        <Flexbox gap={4} style={{ minWidth: 0 }}>
          <Text strong style={{ fontSize: 16 }}>
            {detail.name}
          </Text>
          <Text type={'secondary'}>{detail.description || t('oauthApp.detail.noDescription')}</Text>
        </Flexbox>
      </Flexbox>
    </SectionCard>
  );
};

export default BasicInfoCard;
