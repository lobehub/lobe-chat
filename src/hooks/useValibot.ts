import React, { Dispatch, SetStateAction, useState } from "react";
import { object, ObjectEntries, safeParse } from "valibot";

function omit(obj: any, ...props: any[]) {
  let newObj = { ...obj };
  for (const prop of props) {
    delete newObj[prop];
  }
  return newObj;
}
type ErrorType<T> = {
  errorPath?: keyof T;
  msg?: string;
};
const useValibot = <T extends Record<string, any>>(
  entries: ObjectEntries,
  initialState: T,
): [
  T,
  Dispatch<SetStateAction<T>>,
  handleChange: (
    key: keyof T,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void,
  (
    callback: (
      success: boolean,
      data: T,
      errors: ErrorType<T> | undefined,
    ) => void,
    ignores: (keyof T)[],
  ) => void,
  ErrorType<T>,
] => {
  const Schema = object(entries);
  //type Type = Output<typeof Schema>; // { email: string; password: string }
  const [state, setState] = useState<T>(initialState);

  const [errors, setErrors] = useState<ErrorType<T>>({});
  const handleChange = (key: keyof T) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      // 使用展开运算符来更新状态
      setState({ ...state, [key]: e.target.value });
      // 假设 loginParams 是当前的状态对象
    };
  };
  const isValidated = (
    callback: (
      success: boolean,
      data: T,
      errors: ErrorType<T> | undefined,
    ) => void,
    ignores: (keyof T)[] = [],
  ) => {
    let result = null;

    if (ignores && ignores.length > 0) {
      //     type ExcludeKeys<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
      //     const ignores = ['code'] as const;
      // // A type that represents the keys to ignore
      //     type Ignores = typeof ignores[number];
      // // New type with 'code' property excluded
      //     type Result = ExcludeKeys<T, Ignores>;
      //       const {code, ...newEntries} = entries;
      const newEntries = omit(entries, ...ignores);
      // Object.assign({}, entries)
      const Schema1 = object(newEntries);
      result = safeParse(Schema1, state, { abortEarly: true });
    } else result = safeParse(Schema, state, { abortEarly: true });

    // console.log(res1)
    // alert(JSON.stringify(res1))
    // callback(res1.data as T)
    if (result.success) {
      setErrors({});
      callback(true, result.data as T, undefined);
    } else {
      const errorPath = result.error.issues.at(0)?.path?.at(0)?.key as string;
      const msg = result.error.issues.at(0)?.message;
      console.log(errorPath, msg);
      const newErrors = { errorPath, msg };
      setErrors(newErrors);
      callback(false, result.data as T, newErrors);
      // useEffect(() => {
      //   // 这里的代码会在 `errors` 更新后执行
      //   console.log(errors);
      // }, [errors]); // 把 `errors` 作为依赖项
      //
      // result.errors.forEach((item) => {
      //   errorObj[item.key] = item.message
      // })
      // setErrors(errorObj)
    }
  };
  return [state, setState, handleChange, isValidated, errors];
};

export default useValibot;
