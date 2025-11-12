import { Metadata } from 'next';

import SignUpForm from './SignUpForm';

export const metadata: Metadata = {
  title: 'Sign Up - LobeChat',
};

export default function SignUpPage() {
  return <SignUpForm />;
}
