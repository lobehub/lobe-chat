'use client';

import { Form, Highlighter } from '@lobehub/ui';
import { Switch } from 'antd';
import { createStyles } from 'antd-style';
import { snakeCase } from 'lodash-es';
import { memo, useMemo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_FEATURE_FLAGS } from '@/config/featureFlags';

const useStyles = createStyles(({ css, token, prefixCls }) => ({
  container: css`
    * {
      font-family: ${token.fontFamilyCode};
      font-size: 12px;
    }
    .${prefixCls}-form-item {
      padding-block: 4px;
    }
  `,
}));

const FeatureFlagForm = memo<{ flags: any }>(({ flags }) => {
  const { styles } = useStyles();
  const [data, setData] = useState(flags);

  const output = useMemo(
    () =>
      Object.entries(data).map(([key, value]) => {
        const flag = snakeCase(key);
        // @ts-ignore
        if (DEFAULT_FEATURE_FLAGS[flag] === value) return false;
        if (value === true) return `+${flag}`;
        return `-${flag}`;
      }),
    [data],
  );

  return (
    <>
      <Flexbox
        className={styles.container}
        height={'100%'}
        paddingInline={16}
        style={{ overflow: 'auto', position: 'relative' }}
        width={'100%'}
      >
        <Form
          initialValues={flags}
          itemMinWidth={'max(75%,240px)'}
          items={Object.keys(flags).map((key) => {
            return {
              children: <Switch size={'small'} />,
              label: snakeCase(key),
              minWidth: undefined,
              name: key,
              valuePropName: 'checked',
            };
          })}
          itemsType={'flat'}
          onValuesChange={(_, v) => setData(v)}
          variant={'pure'}
        />
      </Flexbox>
      <Highlighter
        language={'env'}
        style={{ flex: 'none', fontSize: 12 }}
        wrap
      >{`FEATURE_FLAGS="${output.filter(Boolean).join(',')}"`}</Highlighter>
    </>
  );
});

export default FeatureFlagForm;
