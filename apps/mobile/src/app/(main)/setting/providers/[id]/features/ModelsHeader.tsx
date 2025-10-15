import { Button, Flexbox, Input, Text } from '@lobehub/ui-rn';
import { RefreshCcw } from 'lucide-react-native';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from '../styles';

interface ModelsHeaderProps {
  isFetching: boolean;
  onFetchModels: () => void;
  onSearchChange: (text: string) => void;
  searchKeyword: string;
  totalCount: number;
}

const ModelsHeader = memo<ModelsHeaderProps>(
  ({ isFetching, onFetchModels, onSearchChange, searchKeyword, totalCount }) => {
    const { styles } = useStyles();
    const { t } = useTranslation(['setting']);

    return (
      <Flexbox style={styles.modelsHeader}>
        <Flexbox style={styles.modelsTitleRow}>
          <Flexbox style={styles.modelsTitleContainer}>
            <Text style={styles.modelsTitle}>
              {t('aiProviders.models.title', { ns: 'setting' })}
            </Text>
            <Text style={styles.modelsCount}>
              {t('aiProviders.models.modelsAvailable', {
                count: totalCount,
                ns: 'setting',
              })}
            </Text>
          </Flexbox>

          <Flexbox style={styles.modelsActions}>
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
        </Flexbox>

        <Input.Search
          onChangeText={onSearchChange}
          placeholder={t('aiProviders.models.searchPlaceholder', { ns: 'setting' })}
          style={styles.modelsSearchInput}
          value={searchKeyword}
          variant="outlined"
        />
      </Flexbox>
    );
  },
);

ModelsHeader.displayName = 'ModelsHeader';

export default ModelsHeader;
