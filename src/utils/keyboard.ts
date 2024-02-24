import { KeyboardEvent } from 'react';

import { isMacOS } from './platform';

export const isCommandPressed = (event: KeyboardEvent) => {
  const isMac = isMacOS();

  if (isMac) {
    return event.metaKey; // Use metaKey (Command key) on macOS
  } else {
    return event.ctrlKey; // Use ctrlKey on Windows/Linux
  }
};

export const isUserPromptRequest = (e: KeyboardEvent): boolean => {
  // Check if Alt key is pressed along with `/`
  const valid = e.key === '/' && e.altKey;

  if (valid) e.preventDefault();

  return valid;
};

export const extractVariables = (
  text: string,
): Array<{
  from: number;
  name: string;
  to: number;
  variable: string;
}> => {
  const variablePattern = /{{([^}]+)}}/g;
  let match;
  const variables = [];

  while ((match = variablePattern.exec(text)) !== null) {
    variables.push({
      from: match.index,
      name: match[1],
      to: match.index + match[0].length,
      variable: match[0],
    });
  }

  return variables;
};

export const navigateCursor = (textArea: HTMLTextAreaElement, position: number) => {
  textArea.selectionStart = textArea.selectionEnd = position;
  textArea.blur();
  textArea.focus();
};

export const navigateToEnd = (textArea: HTMLTextAreaElement) => {
  if (textArea.selectionEnd !== textArea.value.length) {
    navigateCursor(textArea, textArea.value.length);
    return true;
  }
  return false;
};

export const navigateToNextVariable = (textArea: HTMLTextAreaElement): boolean => {
  const value = textArea?.value || '';
  const variables = extractVariables(value);

  if (!variables.length) return navigateToEnd(textArea);

  const currentMousePosition = textArea.selectionStart;
  const nextVariable = variables.find((variable) => {
    if (textArea.selectionStart === variable.from && textArea.selectionEnd === variable.to) {
      return false;
    }
    return currentMousePosition < variable.to;
  });

  if (!nextVariable) return navigateToEnd(textArea);

  // Select the {{variable}} text and scroll to it
  navigateCursor(textArea, nextVariable.from);
  textArea.selectionEnd = nextVariable.to;

  return true;
};

export const handleVariableNavigation = (e: KeyboardEvent, navigateKey = 'Tab') => {
  if (e.key !== navigateKey) return;
  if (navigateToNextVariable(e.target as HTMLTextAreaElement)) {
    e.preventDefault();
  }
};
