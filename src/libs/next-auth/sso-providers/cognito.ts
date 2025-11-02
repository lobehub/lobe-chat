import Cognito from 'next-auth/providers/cognito';

const provider = {
  id: 'cognito',
  provider: Cognito({}),
};

export default provider;
