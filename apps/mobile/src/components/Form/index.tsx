import React from 'react';
import { StyleProp, Text, View, ViewProps, ViewStyle } from 'react-native';

import { useStyles } from './style';

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

type FormCallbacks = {
  onFinish?: (values: FormValues) => void;
  onFinishFailed?: (errors: FormErrors) => void;
  onValuesChange?: (changedValues: Partial<FormValues>, allValues: FormValues) => void;
};

type FormInstanceApi = FormInstance & {
  registerField: (name: string, rules?: FormRule[]) => void;
  unregisterField: (name: string) => void;
};

type InternalFormInstance = FormInstance & {
  __INTERNAL__?: {
    init: (api: FormInstanceApi) => void;
  };
};

const createFormInstance = (): InternalFormInstance => {
  let api: FormInstanceApi | undefined;

  const ensureApi = () => api;

  const instance: InternalFormInstance = {
    __INTERNAL__: {
      init(nextApi) {
        api = nextApi;
      },
    },
    getFieldValue(name) {
      return ensureApi()?.getFieldValue(name);
    },
    getFieldsValue() {
      return ensureApi()?.getFieldsValue() ?? {};
    },
    markFieldTouched(name, touched) {
      ensureApi()?.markFieldTouched(name, touched);
    },
    resetFields(names) {
      ensureApi()?.resetFields(names);
    },
    async setFieldValue(name, value, options) {
      await (ensureApi()?.setFieldValue(name, value, options) ?? Promise.resolve());
    },
    async setFieldsValue(values, options) {
      await (ensureApi()?.setFieldsValue(values, options) ?? Promise.resolve());
    },
    async submit() {
      await (ensureApi()?.submit() ?? Promise.resolve());
    },
    async validateFields(names) {
      return (await ensureApi()?.validateFields(names)) ?? {};
    },
  };

  return instance;
};

export const useForm = (form?: FormInstance): [FormInstance] => {
  const formRef = React.useRef<FormInstance>(null);

  if (!formRef.current) {
    formRef.current = form ?? createFormInstance();
  }

  return [formRef.current];
};

type FormContextValue = {
  errors: FormErrors;
  hasSubmitted: boolean;
  markFieldTouched: (name: string, touched?: boolean) => void;
  registerField: (name: string, rules?: FormRule[]) => void;
  setFieldValue: (name: string, value: FormValue, options?: SetFieldValueOptions) => Promise<void>;
  touched: Record<string, boolean>;
  unregisterField: (name: string) => void;
  values: FormValues;
};

const FormContext = React.createContext<FormContextValue | null>(null);

const useFormContext = () => {
  const context = React.useContext(FormContext);

  if (!context) {
    throw new Error('Form.Item must be used within a Form component.');
  }

  return context;
};

export interface FormProps extends ViewProps {
  form?: FormInstance;
  initialValues?: FormValues;
  onFinish?: (values: FormValues) => void;
  onFinishFailed?: (errors: FormErrors) => void;
  onValuesChange?: (changedValues: Partial<FormValues>, allValues: FormValues) => void;
}

const isEmptyValue = (value: FormValue) => value === undefined || value === null || value === '';

const runValidation = async (
  name: string,
  value: FormValue,
  values: FormValues,
  rules: FormRule[] | undefined,
) => {
  if (!rules || rules.length === 0) return undefined;

  for (const rule of rules) {
    if (rule.required && isEmptyValue(value)) {
      return rule.message ?? 'This field is required';
    }

    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message ?? 'Value does not match pattern';
    }

    if (rule.validator) {
      const result = await rule.validator(value, values);
      if (typeof result === 'string' && result) {
        return result;
      }
    }
  }

  return undefined;
};

const FormBase = React.forwardRef<FormInstance, FormProps>((props, ref) => {
  const {
    children,
    form: formProp,
    initialValues,
    style,
    onFinish,
    onFinishFailed,
    onValuesChange,
    ...rest
  } = props;
  const { styles } = useStyles();
  const [values, setValues] = React.useState<FormValues>(() => ({ ...initialValues }));
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  const fieldsRef = React.useRef<Record<string, FormRule[]>>({});
  const initialValuesRef = React.useRef<FormValues>({ ...initialValues });
  const valuesRef = React.useRef<FormValues>(values);
  const errorsRef = React.useRef<FormErrors>(errors);
  const callbacksRef = React.useRef<FormCallbacks>({
    onFinish,
    onFinishFailed,
    onValuesChange,
  });

  React.useEffect(() => {
    if (initialValues) {
      initialValuesRef.current = { ...initialValues };
      setValues({ ...initialValues });
      valuesRef.current = { ...initialValues };
      setErrors({});
      errorsRef.current = {};
      setTouched({});
      setHasSubmitted(false);
    }
  }, [initialValues]);

  React.useEffect(() => {
    callbacksRef.current = { onFinish, onFinishFailed, onValuesChange };
  }, [onFinish, onFinishFailed, onValuesChange]);

  React.useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const updateErrors = React.useCallback((updater: (prev: FormErrors) => FormErrors) => {
    setErrors((prev) => {
      const next = updater(prev);
      errorsRef.current = next;
      return next;
    });
  }, []);

  const registerField = React.useCallback((name: string, rules?: FormRule[]) => {
    fieldsRef.current[name] = rules ?? [];

    if (!(name in valuesRef.current) && name in initialValuesRef.current) {
      setValues((prev) => {
        const next = { ...prev, [name]: initialValuesRef.current[name] };
        valuesRef.current = next;
        return next;
      });
    }
  }, []);

  const unregisterField = React.useCallback(
    (name: string) => {
      delete fieldsRef.current[name];

      updateErrors((prev) => {
        if (!(name in prev)) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });

      setTouched((prev) => {
        if (!(name in prev)) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });
    },
    [updateErrors],
  );

  const markFieldTouched = React.useCallback((name: string, touchedValue = true) => {
    setTouched((prev) => {
      const isTouched = !!prev[name];
      if (isTouched === touchedValue) return prev;

      const next = { ...prev };
      if (touchedValue) {
        next[name] = true;
      } else {
        delete next[name];
      }
      return next;
    });
  }, []);

  const setFieldValue = React.useCallback(
    async (name: string, value: FormValue, options?: SetFieldValueOptions) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        valuesRef.current = next;
        return next;
      });

      if (options?.markTouched !== undefined) {
        markFieldTouched(name, options.markTouched);
      }

      if (options?.validate !== false && fieldsRef.current[name]) {
        const message = await runValidation(
          name,
          value,
          valuesRef.current,
          fieldsRef.current[name],
        );
        updateErrors((prev) => {
          const next = { ...prev };
          if (message) {
            next[name] = message;
          } else {
            delete next[name];
          }
          return next;
        });
      }

      callbacksRef.current.onValuesChange?.({ [name]: value }, valuesRef.current);
    },
    [markFieldTouched, updateErrors],
  );

  const setFieldsValue = React.useCallback(
    async (nextValues: Partial<FormValues>, options?: SetFieldsValueOptions) => {
      if (!nextValues) return;

      setValues((prev) => {
        const merged = { ...prev, ...nextValues };
        valuesRef.current = merged;
        return merged;
      });

      const names = Object.keys(nextValues);

      if (options?.markTouched !== undefined) {
        setTouched((prev) => {
          const updated = { ...prev };
          names.forEach((fieldName) => {
            if (options.markTouched) {
              updated[fieldName] = true;
            } else {
              delete updated[fieldName];
            }
          });
          return updated;
        });
      }

      if (options?.validate !== false) {
        const validationResults = await Promise.all(
          names.map(async (name) => {
            const message = await runValidation(
              name,
              nextValues[name],
              valuesRef.current,
              fieldsRef.current[name],
            );
            return { message, name };
          }),
        );

        updateErrors((prev) => {
          const updated = { ...prev };
          validationResults.forEach(({ name, message }) => {
            if (message) {
              updated[name] = message;
            } else {
              delete updated[name];
            }
          });
          return updated;
        });
      } else {
        updateErrors((prev) => {
          const updated = { ...prev };
          names.forEach((name) => {
            delete updated[name];
          });
          return updated;
        });
      }

      callbacksRef.current.onValuesChange?.(nextValues, valuesRef.current);
    },
    [updateErrors],
  );

  const resetFields = React.useCallback(
    (names?: string[]) => {
      if (!names || names.length === 0) {
        const next = { ...initialValuesRef.current };
        valuesRef.current = next;
        setValues(next);
        updateErrors(() => ({}));
        setTouched({});
        setHasSubmitted(false);
        return;
      }

      setValues((prev) => {
        const next = { ...prev };
        names.forEach((name) => {
          if (name in initialValuesRef.current) {
            next[name] = initialValuesRef.current[name];
          } else {
            delete next[name];
          }
        });
        valuesRef.current = next;
        return next;
      });

      updateErrors((prev) => {
        const next = { ...prev };
        names.forEach((name) => {
          delete next[name];
        });
        return next;
      });

      setTouched((prev) => {
        const next = { ...prev };
        names.forEach((name) => {
          delete next[name];
        });
        return next;
      });
    },
    [updateErrors],
  );

  const validateFields = React.useCallback(
    async (names?: string[]) => {
      const targetNames = names && names.length > 0 ? names : Object.keys(fieldsRef.current);
      const validationResults = await Promise.all(
        targetNames.map(async (name) => {
          const message = await runValidation(
            name,
            valuesRef.current[name],
            valuesRef.current,
            fieldsRef.current[name],
          );
          return { message, name };
        }),
      );

      const hasError = validationResults.some(({ message }) => !!message);

      updateErrors((prev) => {
        const next = { ...prev };
        validationResults.forEach(({ name, message }) => {
          if (message) {
            next[name] = message;
          } else {
            delete next[name];
          }
        });
        return next;
      });

      if (hasError) {
        setHasSubmitted(true);
        const errorsMap: FormErrors = {};
        validationResults.forEach(({ name, message }) => {
          errorsMap[name] = message;
        });
        callbacksRef.current.onFinishFailed?.(errorsMap);
        throw errorsMap;
      }

      return valuesRef.current;
    },
    [updateErrors],
  );

  const submit = React.useCallback(async () => {
    setHasSubmitted(true);
    try {
      const validatedValues = await validateFields();
      callbacksRef.current.onFinish?.(validatedValues);
    } catch {
      // validation errors handled inside validateFields
    }
  }, [validateFields]);

  const [internalFormInstance] = useForm(formProp);

  const getFieldValue = React.useCallback((name: string) => valuesRef.current[name], []);

  const getFieldsValue = React.useCallback(() => ({ ...valuesRef.current }), []);

  const formApi = React.useMemo<FormInstanceApi>(
    () => ({
      getFieldValue,
      getFieldsValue,
      markFieldTouched,
      registerField,
      resetFields,
      setFieldValue,
      setFieldsValue,
      submit,
      unregisterField,
      validateFields,
    }),
    [
      getFieldValue,
      getFieldsValue,
      markFieldTouched,
      resetFields,
      setFieldValue,
      setFieldsValue,
      submit,
      validateFields,
      registerField,
      unregisterField,
    ],
  );

  React.useEffect(() => {
    internalFormInstance.__INTERNAL__?.init(formApi);
  }, [internalFormInstance, formApi]);

  React.useImperativeHandle(ref, () => internalFormInstance);

  const contextValue = React.useMemo<FormContextValue>(
    () => ({
      errors,
      hasSubmitted,
      markFieldTouched,
      registerField,
      setFieldValue,
      touched,
      unregisterField,
      values,
    }),
    [
      errors,
      hasSubmitted,
      markFieldTouched,
      registerField,
      setFieldValue,
      touched,
      unregisterField,
      values,
    ],
  );

  return (
    <FormContext.Provider value={contextValue}>
      <View {...rest} style={[styles.form, style]}>
        {children}
      </View>
    </FormContext.Provider>
  );
});

FormBase.displayName = 'Form';

export interface FormItemProps {
  children: React.ReactElement;
  extra?: React.ReactNode;
  getValueFromEvent?: (...args: unknown[]) => FormValue;
  help?: React.ReactNode;
  label?: React.ReactNode;
  name?: string;
  requiredMark?: boolean;
  rules?: FormRule[];
  style?: StyleProp<ViewStyle>;
  trigger?: string;
  validateTrigger?: string | string[];
  valuePropName?: string;
}

const normalizeValidateTrigger = (trigger?: string | string[]) => {
  if (!trigger) return [];
  return Array.isArray(trigger) ? trigger : [trigger];
};

export const FormItem: React.FC<FormItemProps> = ({
  children,
  extra,
  help,
  label,
  name,
  requiredMark,
  rules,
  style,
  trigger = 'onChangeText',
  validateTrigger,
  valuePropName = 'value',
  getValueFromEvent,
}) => {
  const { styles: formItemStyles } = useStyles();
  const {
    errors,
    hasSubmitted,
    markFieldTouched,
    registerField,
    setFieldValue,
    touched,
    unregisterField,
    values,
  } = useFormContext();

  const fieldName = typeof name === 'string' && name.length > 0 ? name : undefined;

  React.useEffect(() => {
    if (!fieldName) return;
    registerField(fieldName, rules);
    return () => unregisterField(fieldName);
  }, [fieldName, registerField, unregisterField, rules]);

  const triggers = React.useMemo(() => {
    const list = normalizeValidateTrigger(validateTrigger);
    if (list.length === 0) return [trigger];
    return list;
  }, [trigger, validateTrigger]);

  const child = React.Children.only(children);
  let controlledChild = child;

  if (fieldName && React.isValidElement(child)) {
    const childProps: Record<string, unknown> = {};
    const fieldValue = values[fieldName];
    childProps[valuePropName] =
      fieldValue === undefined && valuePropName === 'value' ? '' : fieldValue;

    if (trigger) {
      childProps[trigger] = (...args: unknown[]) => {
        const value =
          typeof getValueFromEvent === 'function' ? getValueFromEvent(...args) : args[0];
        void setFieldValue(fieldName, value, {
          markTouched: true,
          validate: triggers.includes(trigger),
        });

        const originalTrigger = (child.props as Record<string, unknown>)[trigger];
        if (typeof originalTrigger === 'function') {
          (originalTrigger as (...eventArgs: unknown[]) => void)(...args);
        }
      };
    }

    if (triggers.includes('onBlur')) {
      childProps.onBlur = (...args: unknown[]) => {
        markFieldTouched(fieldName, true);
        void setFieldValue(fieldName, childProps[valuePropName], { validate: true });

        const originalOnBlur = (child.props as Record<string, unknown>).onBlur;
        if (typeof originalOnBlur === 'function') {
          (originalOnBlur as (...eventArgs: unknown[]) => void)(...args);
        }
      };
    }

    controlledChild = React.cloneElement(child, childProps);
  }

  const error = fieldName ? errors[fieldName] : undefined;
  const shouldShowError = !!(fieldName && error && (hasSubmitted || touched[fieldName]));
  const isRequired = requiredMark ?? rules?.some((rule) => rule.required) ?? false;
  const shouldShowHelp = !!help && !shouldShowError;
  const shouldShowExtra = !!extra;

  return (
    <View style={[formItemStyles.itemContainer, style]}>
      {label && (
        <View style={formItemStyles.labelRow}>
          {isRequired && <Text style={formItemStyles.required}>*</Text>}
          <Text style={[formItemStyles.label]}>{label}</Text>
        </View>
      )}
      <View>{controlledChild}</View>
      {shouldShowError && (
        <Text style={[formItemStyles.message, formItemStyles.errorMessage]}>{error}</Text>
      )}
      {shouldShowHelp && (
        <Text style={[formItemStyles.message, formItemStyles.helpMessage]}>{help}</Text>
      )}
      {shouldShowExtra && (
        <Text style={[formItemStyles.message, formItemStyles.extraMessage]}>{extra}</Text>
      )}
    </View>
  );
};

const FormComponent = FormBase as typeof FormBase & {
  Item: typeof FormItem;
  useForm: typeof useForm;
};

FormComponent.Item = FormItem;
FormComponent.useForm = useForm;

export default FormComponent;
