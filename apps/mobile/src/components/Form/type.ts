import type { ReactElement, ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

export type FormValue = unknown;
export type FormValues = Record<string, FormValue>;

export interface FormRule {
  message?: string;
  pattern?: RegExp;
  required?: boolean;
  validator?: (value: FormValue, values: FormValues) => string | void | Promise<string | void>;
}

export interface SetFieldValueOptions {
  markTouched?: boolean;
  validate?: boolean;
}

export interface SetFieldsValueOptions extends SetFieldValueOptions {
  markTouched?: boolean;
}

export type FormErrors = Record<string, string | undefined>;

export interface FormInstance {
  [x: string]: any;
  getFieldValue: (name: string) => FormValue;
  getFieldsValue: () => FormValues;
  markFieldTouched: (name: string, touched?: boolean) => void;
  resetFields: (names?: string[]) => void;
  setFieldValue: (name: string, value: FormValue, options?: SetFieldValueOptions) => Promise<void>;
  setFieldsValue: (values: Partial<FormValues>, options?: SetFieldsValueOptions) => Promise<void>;
  submit: () => Promise<void>;
  validateFields: (names?: string[]) => Promise<FormValues>;
}

export interface FormProps extends ViewProps {
  form?: FormInstance;
  initialValues?: FormValues;
  onFinish?: (values: FormValues) => void;
  onFinishFailed?: (errors: FormErrors) => void;
  onValuesChange?: (changedValues: Partial<FormValues>, allValues: FormValues) => void;
}

export interface FormItemProps {
  children: ReactElement;
  extra?: ReactNode;
  getValueFromEvent?: (...args: unknown[]) => FormValue;
  help?: ReactNode;
  label?: ReactNode;
  name?: string;
  requiredMark?: boolean;
  rules?: FormRule[];
  style?: StyleProp<ViewStyle>;
  trigger?: string;
  validateTrigger?: string | string[];
  valuePropName?: string;
}
