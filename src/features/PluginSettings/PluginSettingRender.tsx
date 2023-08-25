import { Input, InputNumber, Switch } from 'antd';
import { memo } from 'react';

interface PluginSettingsProps {
  defaultValue?: any;
  format?: string;
  onChange: (value: any) => void;
  props?: any;
  type?: 'string' | 'number' | 'boolean';
}

const PluginSettingRender = memo<PluginSettingsProps>(
  ({ type, defaultValue, onChange, format, props }) => {
    switch (type) {
      case 'string': {
        switch (format) {
          case 'password': {
            return (
              <Input.Password
                {...props}
                defaultValue={defaultValue}
                onChange={(v) => {
                  onChange(v.target.value);
                }}
              />
            );
          }
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
