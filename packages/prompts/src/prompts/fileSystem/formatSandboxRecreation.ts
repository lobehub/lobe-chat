/** Keep workspace loss visible even when the command itself completed successfully. */
export const formatSandboxRecreation = (content: string, recreated?: boolean): string =>
  recreated
    ? `Warning: The sandbox session expired and was recreated. Files from the previous session may have been lost. Do not silently regenerate previous work. Inform the user, restore from persistent checkpoints when available, and ask before repeating expensive generation.\n\n${content}`
    : content;
