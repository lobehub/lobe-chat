import { Allow, parse } from 'partial-json';
import { stringify } from 'yaml';

export const useYamlArguments = (args: string) => {
  try {
    const obj = parse(args, Allow.OBJ);
    return stringify(obj);
  } catch {
    return args;
  }
};
