'use client';

import { Button, InputNumber, InputNumberProps, Tooltip } from '@lobehub/ui';
import { Dices } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

export type SeedNumberInputProps = InputNumberProps;

const SeedNumberInput = memo<SeedNumberInputProps>(
  ({ value, step = 1, onChange, style, className, ...rest }) => {
    const { t } = useTranslation('image');

    return (
      <Flexbox className={className} gap={4} horizontal style={style}>
        <InputNumber
          placeholder={t('config.seed.random')}
          step={step}
          style={{ width: '100%' }}
          value={value}
          {...rest}
        />
        <Tooltip title={t('config.seed.random')}>
          <Button
            disabled={!value}
            icon={Dices}
            onClick={() => onChange?.(null)}
            style={{ flex: 'none', width: 62 }}
            type={'primary'}
            variant={'outlined'}
          />
        </Tooltip>
      </Flexbox>
    );
  },
);

export default SeedNumberInput;
