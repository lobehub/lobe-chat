import { useCallback, useEffect, useRef, useState } from 'react';

import { detectProseValue } from './detectProseValue';

export interface UseSecretInputFormParams {
  fields: string[];
  /**
   * Receives the plaintext values. A rejection keeps them so the user can
   * retry without re-entering a secret the provider may not show again.
   */
  onSubmit: (values: Record<string, string>) => Promise<void>;
}

/**
 * Value lifecycle of a secret form.
 *
 * Values live in a ref, not React state or any store, so they never reach
 * devtools state snapshots, draft persistence or re-render props. They are
 * dropped after a successful submit or on unmount; a failed submit keeps them
 * for the retry. Only which fields are filled is kept in state.
 *
 * Prose guard: a submit whose values look like prose (a pasted sentence or
 * chat text, the exact T-967 failure) is held instead of handed to the sink;
 * the view shows a warning and calls `confirmProseSubmit` to let it through.
 * The acknowledged state survives failed submissions (the retry must not ask
 * the user to confirm the same values again) and is cleared by a successful
 * submit or by editing any field.
 */
export const useSecretInputForm = ({ fields, onSubmit }: UseSecretInputFormParams) => {
  const valuesRef = useRef<Record<string, string>>({});
  const [filled, setFilled] = useState<Set<string>>(() => new Set());
  const [submitting, setSubmitting] = useState(false);
  const [proseWarning, setProseWarning] = useState<string[] | undefined>();
  // Bumping the key remounts the uncontrolled inputs, clearing their DOM values.
  const [formKey, setFormKey] = useState(0);

  useEffect(
    () => () => {
      valuesRef.current = {};
    },
    [],
  );

  const handleChange = useCallback((field: string, value: string) => {
    valuesRef.current[field] = value;
    // Editing a field clears any stale prose warning from a previous submit.
    setProseWarning(undefined);
    setFilled((prev) => {
      const hasValue = value.length > 0;
      if (prev.has(field) === hasValue) return prev;
      const next = new Set(prev);
      if (hasValue) next.add(field);
      else next.delete(field);
      return next;
    });
  }, []);

  const runSubmit = useCallback(async () => {
    const values = Object.fromEntries(fields.map((field) => [field, valuesRef.current[field]]));
    setSubmitting(true);
    try {
      await onSubmit(values);
      // Success: values are consumed and the acknowledged prose warning is
      // cleared with them. Failure keeps both for the retry.
      valuesRef.current = {};
      setFilled(new Set());
      setProseWarning(undefined);
      setFormKey((key) => key + 1);
    } catch {
      // The caller surfaces the failure; the values stay for the retry.
    } finally {
      setSubmitting(false);
    }
  }, [fields, onSubmit]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    const proseFields = fields.filter((field) => detectProseValue(valuesRef.current[field] ?? ''));
    if (proseFields.length > 0 && !proseWarning) {
      // First press on prose-looking values holds the submit; the view shows
      // a warning and a second press lets the user confirm it is really the
      // intended value.
      setProseWarning(proseFields);
      return;
    }

    // Keep the acknowledged warning through a failed submit so the retry does
    // not make the user confirm the same values again; only a successful
    // submit or editing a field clears it.
    await runSubmit();
  }, [fields, proseWarning, runSubmit, submitting]);

  const confirmProseSubmit = useCallback(async () => {
    if (submitting) return;
    await runSubmit();
  }, [runSubmit, submitting]);

  const complete = fields.length > 0 && fields.every((field) => filled.has(field));

  return {
    complete,
    confirmProseSubmit,
    formKey,
    handleChange,
    handleSubmit,
    proseWarning,
    submitting,
  };
};
