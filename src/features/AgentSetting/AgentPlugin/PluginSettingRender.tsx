// import { Input } from '@lobehub/ui';
import { Input, InputNumber, Switch } from 'antd';
import { memo } from 'react';

interface PluginSettingsProps {
  format?: string;
  props?: any;
  type?: 'string' | 'number' | 'boolean';
}

const PluginSettingRender = memo<PluginSettingsProps>(({ type, format, props }) => {
  switch (type) {
    case 'string': {
      switch (format) {
        case 'password': {
          return <Input.Password {...props} />;
        }
      }
      return <Input {...props} />;
    }
    case 'number': {
      return <InputNumber {...props} />;
    }
    case 'boolean': {
      return <Switch {...props} />;
    }
  }
});

export default PluginSettingRender;
