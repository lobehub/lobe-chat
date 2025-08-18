import { produce } from 'immer';

export const preventLeavingFn = (e: BeforeUnloadEvent) => {
  // set returnValue to trigger alert modal
  // Note: No matter what value is set, the browser will display the standard text
  e.returnValue = '你有正在生成中的请求，确定要离开吗？';
};

export const toggleBooleanList = (ids: string[], id: string, loading: boolean) => {
  return produce(ids, (draft) => {
    if (loading) {
      if (!draft.includes(id)) draft.push(id);
    } else {
      const index = draft.indexOf(id);

      if (index >= 0) draft.splice(index, 1);
    }
  });
};
