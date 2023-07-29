import { Table } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { PluginRenderProps } from '@/plugins/type';

import { WeatherResult } from './type';

const useStyles = createStyles(({ css, token }) => ({
  time: css`
    color: ${token.colorTextQuaternary};
  `,
  title: css`
    font-weight: bold;
  `,
}));

const Render = memo<PluginRenderProps<WeatherResult>>(({ content }) => {
  const { t } = useTranslation('plugin');

  const { styles } = useStyles();
  return (
    <div>
      {content.map((item, index) => (
        <Flexbox gap={8} key={`${item.city}-${index}`}>
          <Flexbox align={'center'} distribution={'space-between'} horizontal>
            <div className={styles.title}>{t('realtimeWeather.title', { city: item.city })}</div>
            <div className={styles.time}>
              {t('realtimeWeather.updateAt')}： {item.reporttime}
            </div>
          </Flexbox>
          <Table
            bordered
            columns={[
              { dataIndex: 'date', title: t('realtimeWeather.data.date') },
              { dataIndex: 'week', title: t('realtimeWeather.data.week') },
              { dataIndex: 'dayweather', title: t('realtimeWeather.data.dayweather') },
              { dataIndex: 'daytemp_float', title: t('realtimeWeather.data.daytemp_float') },
              { dataIndex: 'daywind', title: t('realtimeWeather.data.daywind') },
              { dataIndex: 'nightweather', title: t('realtimeWeather.data.nightweather') },
              { dataIndex: 'nighttemp_float', title: t('realtimeWeather.data.nighttemp_float') },
            ]}
            dataSource={item.casts}
            pagination={false}
          />
        </Flexbox>
      ))}
    </div>
  );
});
export default Render;
