import { Button, Flexbox, Input } from '@lobehub/ui-rn';
import { RefreshCcw } from 'lucide-react-native';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface ModelsHeaderProps {
  isFetching: boolean;
  onFetchModels: () => void;
  onSearchChange: (text: string) => void;
  searchKeyword: string;
  totalCount: number;
}

const ModelsHeader = memo<ModelsHeaderProps>(
  ({ isFetching, onFetchModels, onSearchChange, searchKeyword, totalCount }) => {
    const { t } = useTranslation(['setting']);

    return (
      <Flexbox align={'center'} gap={8} horizontal paddingInline={16} style={{ marginTop: 16 }}>
        <Input.Search
          onChangeText={onSearchChange}
          placeholder={t('aiProviders.models.modelsAvailable', {
            count: totalCount,
            ns: 'setting',
          })}
          style={{ flex: 1 }}
          value={searchKeyword}
          variant="filled"
        />
        <Button
          disabled={isFetching}
          icon={<RefreshCcw />}
          loading={isFetching}
          onPress={onFetchModels}
          type="primary"
        >
          {isFetching
            ? t('aiProviders.models.fetching', { ns: 'setting' })
            : t('aiProviders.models.fetch', { ns: 'setting' })}
        </Button>
      </Flexbox>
    );
  },
);

ModelsHeader.displayName = 'ModelsHeader';

export default ModelsHeader;
