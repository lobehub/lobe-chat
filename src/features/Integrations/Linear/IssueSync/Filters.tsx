'use client';

import type { LinearIssueStateType } from '@lobechat/types';
import { Flexbox, Select, Text } from '@lobehub/ui';
import { memo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { linearService } from '@/services/linear';
import { useCurrentProjectList, useProjectStore } from '@/store/project';

import { linearKeys } from '../swrKeys';
import type { LinearImportFilter } from './types';
import { linearStateTypeOptions, linearSyncErrorMessage } from './utils';

const ALL_PROJECTS = '__all__';
const NO_PROJECT = '__none__';

const Field = ({ children, label }: { children: ReactNode; label: string }) => (
  <Flexbox flex={1} gap={6} style={{ minWidth: 200 }}>
    <Text style={{ fontSize: 13 }} type="secondary">
      {label}
    </Text>
    {children}
  </Flexbox>
);

interface FiltersProps {
  connectionId: string;
  disabled?: boolean;
  onChange: (patch: Partial<LinearImportFilter>) => void;
  value: LinearImportFilter;
}

/** Which Linear issues to list, and which LobeHub project receives them. */
const Filters = memo<FiltersProps>(({ connectionId, disabled, onChange, value }) => {
  const { t } = useTranslation('integration');

  const teams = useSWR(linearKeys.teams(connectionId), () => linearService.listTeams(connectionId));
  const projects = useSWR(
    value.teamId ? linearKeys.projects(connectionId, value.teamId) : null,
    () => linearService.listProjects(connectionId, value.teamId!),
  );
  useProjectStore((s) => s.useFetchProjectList)();
  const lobeProjects = useCurrentProjectList();

  return (
    <Flexbox gap={12}>
      <Flexbox horizontal gap={12} wrap={'wrap'}>
        <Field label={t('linear.sync.filter.team')}>
          <Select
            aria-label={t('linear.sync.filter.team')}
            disabled={disabled}
            loading={teams.isLoading}
            placeholder={t('linear.sync.filter.teamPlaceholder')}
            value={value.teamId}
            options={(teams.data ?? []).map((team) => ({
              label: `${team.name} (${team.key})`,
              value: team.id,
            }))}
            onChange={(teamId) => {
              const team = teams.data?.find((item) => item.id === teamId);
              onChange({
                linearProjectId: null,
                linearProjectName: null,
                teamId: team?.id ?? null,
                teamName: team?.name ?? null,
              });
            }}
          />
        </Field>
        <Field label={t('linear.sync.filter.project')}>
          <Select
            aria-label={t('linear.sync.filter.project')}
            disabled={disabled || !value.teamId}
            loading={projects.isLoading}
            value={value.linearProjectId ?? ALL_PROJECTS}
            options={[
              { label: t('linear.sync.filter.allProjects'), value: ALL_PROJECTS },
              ...(projects.data ?? []).map((project) => ({
                label: project.name,
                value: project.id,
              })),
            ]}
            onChange={(projectId) => {
              const project = projects.data?.find((item) => item.id === projectId);
              onChange({
                linearProjectId: project?.id ?? null,
                linearProjectName: project?.name ?? null,
              });
            }}
          />
        </Field>
      </Flexbox>
      <Flexbox horizontal gap={12} wrap={'wrap'}>
        <Field label={t('linear.sync.filter.states')}>
          <Select
            aria-label={t('linear.sync.filter.states')}
            disabled={disabled}
            mode={'multiple'}
            options={linearStateTypeOptions(t)}
            value={value.stateTypes}
            onChange={(types) => {
              const next = (Array.isArray(types) ? types : []) as LinearIssueStateType[];
              // At least one state, or nothing could ever match.
              if (next.length > 0) onChange({ stateTypes: next });
            }}
          />
        </Field>
        <Field label={t('linear.sync.filter.target')}>
          <Select
            aria-label={t('linear.sync.filter.target')}
            disabled={disabled}
            value={value.targetProjectId ?? NO_PROJECT}
            options={[
              { label: t('linear.sync.filter.noProject'), value: NO_PROJECT },
              ...lobeProjects.map((project) => ({ label: project.name, value: project.id })),
            ]}
            onChange={(projectId) =>
              onChange({
                targetProjectId: projectId && projectId !== NO_PROJECT ? String(projectId) : null,
              })
            }
          />
        </Field>
      </Flexbox>
      {teams.error ? (
        <Text style={{ fontSize: 13 }} type="danger">
          {linearSyncErrorMessage(teams.error, t)}
        </Text>
      ) : null}
    </Flexbox>
  );
});

Filters.displayName = 'LinearImportFilters';

export default Filters;
