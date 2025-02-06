import { PropsWithChildren } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

const Page = ({ children }: PropsWithChildren) => {
  return (
    <Flexbox height={'100%'} width={'100%'}>
      <Center height={'100%'} width={'100%'}>
        {children}
      </Center>
    </Flexbox>
  );
};

export default Page;
