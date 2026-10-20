/**
 * @vitest-environment happy-dom
 */
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lobehub/ui', () => ({
  Button: (props: any) => <button {...props} />,
  cssVar: { colorError: 'var(--error)', colorWarning: 'var(--warn)' },
  Flexbox: (props: any) => <div {...props} />,
  Icon: (props: any) => <span {...props} />,
  InputPassword: (props: any) => <input type="password" {...props} />,
  Text: (props: any) => <span {...props} />,
}));
vi.mock('lucide-react', () => ({ CircleAlert: (props: any) => <svg {...props} /> }));

import SecretInputView, { isSecretSubmitDisabled } from './SecretInputView';

const labels = {
  cancel: 'Skip',
  confirmProse: 'Save anyway',
  placeholder: (field: string) => `Enter ${field}`,
  proseWarning: (fields: string[]) => `Prose-looking: ${fields.join(', ')}`,
  submit: 'Save',
  submitting: 'Saving…',
};

describe('isSecretSubmitDisabled', () => {
  it('keeps a completed form submittable', () => {
    expect(isSecretSubmitDisabled({ complete: true, inert: false, proseWarning: undefined })).toBe(
      false,
    );
  });

  it('disables submit when blocked even though the form was completed', () => {
    // Lookup failed / permission lost / type mismatch after completion: the
    // fields are replaced by the reason, so Save must not go through.
    expect(
      isSecretSubmitDisabled({ blockedReason: 'Lookup failed', complete: true, inert: false }),
    ).toBe(true);
  });

  it('disables an incomplete form without a pending prose confirmation', () => {
    expect(isSecretSubmitDisabled({ complete: false, inert: false })).toBe(true);
  });

  it('allows the prose-confirm path for a warning state', () => {
    expect(isSecretSubmitDisabled({ complete: true, inert: false, proseWarning: ['F'] })).toBe(
      false,
    );
  });

  it('disables while inert', () => {
    expect(isSecretSubmitDisabled({ complete: true, inert: true })).toBe(true);
  });
});

describe('SecretInputView blocked submit', () => {
  afterEach(cleanup);

  it('renders a disabled Save when a completed form later becomes blocked', () => {
    const { getByRole } = render(
      <SecretInputView
        blockedReason={'A credential with this key already exists with a different type'}
        fields={['OPENAI_API_KEY']}
        labels={labels}
        onCancel={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const save = getByRole('button', { name: 'Save' }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
  });
});
