import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { message } from '@/components/AntdStaticMethods';
import { authEnv } from '@/envs/auth';
import { signUp } from '@/libs/better-auth/auth-client';

export interface SignUpFormValues {
  email: string;
  password: string;
}

export const useSignUp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (values: SignUpFormValues) => {
    setLoading(true);
    try {
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      const username = values.email.split('@')[0];

      const { error } = await signUp.email({
        callbackURL: callbackUrl,
        email: values.email,
        name: username,
        password: values.password,
      });

      if (error) {
        const isEmailDuplicate =
          error.code === 'FAILED_TO_CREATE_USER' &&
          (error as any)?.details?.cause?.code === '23505';

        if (isEmailDuplicate) {
          message.error('betterAuth.errors.emailExists');
          return;
        }

        if (error.code === 'INVALID_EMAIL') {
          message.error('betterAuth.errors.emailInvalid');
          return;
        }

        message.error(error.message || 'betterAuth.signup.error');
        return;
      }

      if (authEnv.NEXT_PUBLIC_AUTH_EMAIL_VERIFICATION) {
        router.push(
          `/verify-email?email=${encodeURIComponent(values.email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`,
        );
      } else {
        router.push(callbackUrl);
      }
    } catch {
      message.error('betterAuth.signup.error');
    } finally {
      setLoading(false);
    }
  };

  return { loading, onSubmit: handleSignUp };
};
