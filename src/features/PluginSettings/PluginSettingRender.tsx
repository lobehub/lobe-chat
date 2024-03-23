import { Input, InputNumber, Select, Slider, Switch } from 'antd';
import { JSONSchema7Type } from 'json-schema';
import { memo } from 'react';

interface PluginSettingsProps {
  defaultValue?: any;
  enum?: JSONSchema7Type[];
  format?: string;
  maximum?: number;
  minimum?: number;
  onChange: (value: any) => void;
  props?: any;
  type?: 'string' | 'number' | 'boolean';
}

const PluginSettingRender = memo<PluginSettingsProps>(
  ({ type, defaultValue, enum: enumItems, onChange, format, minimum, maximum, props }) => {
    switch (type) {
      case 'string': {
        switch (format) {
          case 'password': {
            return (
              <Input.Password
                {...props}
                autoComplete={'new-password'}
                defaultValue={defaultValue}
                onChange={(v) => {
                  onChange(v.target.value);
                }}
              />
            );
          }
        }

        if (enumItems) {
          return (
            <Select
              defaultValue={defaultValue}
              onChange={onChange}
              options={enumItems.map((i) =>
                typeof i === 'string' ? { label: i, value: i } : (i as any),
              )}
            />
          );
        }

        return (
          <Input
            {...props}
            defaultValue={defaultValue}
            onChange={(v) => {
              onChange(v.target.value);
            }}
          />
        );
      }

      case 'number': {
        if (typeof minimum === 'number' || typeof maximum === 'number')
          return <Slider defaultValue={defaultValue} max={maximum} min={minimum} {...props} />;
        return (
          <InputNumber
            {...props}
            defaultValue={defaultValue}
            onChange={(v) => {
              onChange(v);
            }}
          />
        );
      }
      case 'boolean': {
        return (
          <Switch
            {...props}
            defaultValue={defaultValue}
            onChange={(e) => {
              onChange(e);
            }}
          />
        );
      }
    }
  },
);

export default PluginSettingRender;
