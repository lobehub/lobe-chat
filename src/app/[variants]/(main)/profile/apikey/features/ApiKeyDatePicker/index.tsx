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
    // 如果选择了日期，设置为当天的 23:59:59
    const submitData = date ? date.hour(23).minute(59).second(59).millisecond(999) : null;

    onChange?.(submitData);
  };

  return (
    <DatePicker
      key={value?.valueOf() || 'EMPTY'}
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
