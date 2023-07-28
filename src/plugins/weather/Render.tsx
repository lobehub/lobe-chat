import { Table } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { PluginRenderProps } from '@/plugins/type';

import { WeatherResult } from './type';

const Render = memo<PluginRenderProps<WeatherResult>>(({ content }) => {
  const { t } = useTranslation('plugin');

  return (
    <div>
      {content.map((item, index) => (
        <Flexbox gap={8} key={`${item.city}-${index}`}>
          <Flexbox>
            {item.city} 近7日天气预报 | 更新时间： {item.reporttime}
          </Flexbox>
          <Table
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
