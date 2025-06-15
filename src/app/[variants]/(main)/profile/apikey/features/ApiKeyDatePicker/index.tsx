import { DatePicker } from '@lobehub/ui';
import { DatePickerProps, Flex } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface ApiKeyDatePickerProps extends Omit<DatePickerProps, 'onChange'> {
  onChange?: (date: Dayjs | null) => void;
}

const ApiKeyDatePicker: FC<ApiKeyDatePickerProps> = ({ value, onChange, ...props }) => {
  const { t } = useTranslation('auth');

  const handleOnChange = (date: Dayjs | null) => {
    onChange?.(date);
  };

  return (
    <DatePicker
      key={value?.valueOf() || 'empty'}
      value={value}
      {...props}
      minDate={dayjs()}
      onChange={handleOnChange}
      placeholder={t('apikey.form.fields.expiresAt.placeholder')}
      renderExtraFooter={() => (
        <Flex justify="center">
          <a onClick={() => handleOnChange(null)}>{t('apikey.display.neverExpires')}</a>
        </Flex>
      )}
      showNow={false}
    />
  );
};

export default ApiKeyDatePicker;
