'use client';

import { ModelIcon } from '@lobehub/icons';
import { Icon, Text } from '@lobehub/ui';
import { createStyles, useResponsive } from 'antd-style';
import { DotIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ModelTypeIcon from '@/app/[variants]/(main)/discover/(list)/model/features/List/ModelTypeIcon';
import { ModelInfoTags } from '@/components/ModelSelect';

import PublishedTime from '../../../../../../../components/PublishedTime';
import { useDetailContext } from './DetailProvider';

const useStyles = createStyles(({ css, token }) => {
  return {
    desc: css`
      color: ${token.colorTextSecondary};
    `,
    time: css`
      font-size: 12px;
      color: ${token.colorTextDescription};
    `,
    version: css`
      font-family: ${token.fontFamilyCode};
      font-size: 13px;
    `,
  };
});

const Header = memo<{ mobile?: boolean }>(({ mobile: isMobile }) => {
  const { identifier, releasedAt, displayName, type, abilities, contextWindowTokens } =
    useDetailContext();
  const { styles, theme } = useStyles();
  const { mobile = isMobile } = useResponsive();
  const { t } = useTranslation('models');

  return (
    <Flexbox gap={12}>
      <Flexbox align={'flex-start'} gap={16} horizontal width={'100%'}>
        <ModelIcon model={identifier} size={mobile ? 48 : 64} />
        <Flexbox
          flex={1}
          gap={4}
          style={{
            overflow: 'hidden',
          }}
        >
          <Flexbox
            align={'center'}
            gap={8}
            horizontal
            justify={'space-between'}
            style={{
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Flexbox
              align={'center'}
              flex={1}
              gap={12}
              horizontal
              style={{
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Text
                as={'h1'}
                ellipsis={{ rows: 1 }}
                style={{ fontSize: mobile ? 18 : 24, margin: 0 }}
                title={identifier}
              >
                {displayName || identifier}
              </Text>
            </Flexbox>
            <Flexbox align={'center'} gap={6} horizontal>
              {type && <ModelTypeIcon type={type} />}
            </Flexbox>
          </Flexbox>
          <Flexbox align={'center'} gap={4} horizontal>
            <span>{identifier}</span>
            <Icon icon={DotIcon} />
            <ModelInfoTags
              contextWindowTokens={contextWindowTokens}
              directionReverse
              {...abilities}
            />
            <Icon icon={DotIcon} />
            <PublishedTime
              className={styles.time}
              date={releasedAt as string}
              template={'MMM DD, YYYY'}
            />
          </Flexbox>
        </Flexbox>
      </Flexbox>
      <div
        style={{
          color: theme.colorTextSecondary,
        }}
      >
        {t(`${identifier}.description`)}
      </div>
    </Flexbox>
  );
});

export default Header;
