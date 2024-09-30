import { PropsWithChildren, createContext, memo } from 'react';

export const InterceptContext = createContext(false);

const InterceptingLayout = memo<PropsWithChildren>(({ children }) => {
  return <InterceptContext.Provider value={true}>{children}</InterceptContext.Provider>;
});

export default InterceptingLayout;
