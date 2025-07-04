import { Generation } from '@/types/generation';

export interface GenerationItemProps {
  generation: Generation;
  prompt: string;
}

export interface ActionButtonsProps {
  onDelete: () => void;
  onDownload?: () => void;
  onCopySeed?: () => void;
  showDownload?: boolean;
  showCopySeed?: boolean;
  seedTooltip?: string;
}

export interface SuccessStateProps {
  generation: Generation;
  prompt: string;
  aspectRatio: string;
  onDelete: () => void;
  onDownload: () => void;
  onCopySeed?: () => void;
  seedTooltip?: string;
}

export interface ErrorStateProps {
  generation: Generation;
  aspectRatio: string;
  onDelete: () => void;
  onCopyError: () => void;
}

export interface LoadingStateProps {
  generation: Generation;
  aspectRatio: string;
  onDelete: () => void;
}
