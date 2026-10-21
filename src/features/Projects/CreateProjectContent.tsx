import {
  Button,
  cssVar,
  Flexbox,
  Input,
  ModalFooter,
  Text,
  toast,
  useModalContext,
} from '@lobehub/ui';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { type ProjectListItem, useLoadedProjectList, useProjectStore } from '@/store/project';

import {
  applyProjectName,
  getCreateProjectInput,
  isProjectIdentifierTaken,
  isProjectIdentifierValid,
  isProjectSlugValid,
} from './createProjectForm';

export interface CreateProjectOptions {
  /**
   * Handle the created project instead of opening it. Callers that create a
   * project as a step of another action (filing a delivery under a new one)
   * must not have the user navigated away from what they were doing.
   */
  onCreated?: (project: ProjectListItem) => void;
}

interface CreateProjectFormState {
  identifier: string;
  /** Set when the server rejects the identifier as already taken. */
  identifierConflict: boolean;
  identifierEdited: boolean;
  loading: boolean;
  name: string;
  slug: string;
  slugEdited: boolean;
}

export const CreateProjectTitle = memo(() => {
  const { t } = useTranslation('project');

  return t('create.title');
});

const CreateProjectContent = memo<CreateProjectOptions>(({ onCreated }) => {
  const { t } = useTranslation(['project', 'common']);
  const { close } = useModalContext();
  const navigate = useWorkspaceAwareNavigate();
  const createProject = useProjectStore((s) => s.createProject);
  const loadedProjects = useLoadedProjectList();
  const [form, setForm] = useState<CreateProjectFormState>({
    identifier: '',
    identifierConflict: false,
    identifierEdited: false,
    loading: false,
    name: '',
    slug: '',
    slugEdited: false,
  });
  const createInput = getCreateProjectInput(form);
  const identifierValid = isProjectIdentifierValid(form.identifier);
  const identifierInvalid =
    (form.identifierEdited || Boolean(form.name.trim())) && !identifierValid;
  // Identifiers are unique per scope, so a name whose derived prefix is already
  // taken (two projects starting with "lobe…") would otherwise only fail after
  // submit, as an opaque "operation failed".
  const identifierTaken =
    form.identifierConflict ||
    (loadedProjects ? isProjectIdentifierTaken(form.identifier, loadedProjects) : false);
  const identifierError = identifierInvalid || identifierTaken;
  const slugValid = isProjectSlugValid(form.slug);

  const updateForm = (patch: Partial<CreateProjectFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const updateName = (name: string) => {
    setForm((current) => applyProjectName(current, name));
  };

  const handleCreate = async () => {
    if (!createInput || identifierTaken || form.loading) return;
    updateForm({ loading: true });
    try {
      const project = await createProject(createInput);
      close();
      if (onCreated) onCreated(project);
      else navigate(`/project/${project.slug ?? project.id}`);
    } catch (error) {
      console.error('Failed to create project', error);
      // The unique index stays the final authority: a concurrent create, or a
      // private project by another member that the loaded list cannot see, can
      // still collide after the inline check. Report it on the field, not as a
      // generic failure.
      if ((error as { data?: { code?: string } } | undefined)?.data?.code === 'CONFLICT') {
        updateForm({ identifierConflict: true });
        return;
      }
      toast.error(t('operationFailed', { ns: 'common' }));
    } finally {
      updateForm({ loading: false });
    }
  };

  return (
    <>
      <Flexbox gap={16} padding={16}>
        <Flexbox gap={6}>
          <Text fontSize={13} weight={500}>
            {t('create.nameLabel')}
          </Text>
          <Input
            autoFocus
            maxLength={255}
            placeholder={t('create.namePlaceholder')}
            value={form.name}
            onChange={(event) => updateName(event.target.value)}
            onPressEnter={handleCreate}
          />
        </Flexbox>
        <Flexbox gap={6}>
          <Text fontSize={13} weight={500}>
            {t('create.identifierLabel')}
          </Text>
          <Input
            aria-invalid={identifierError}
            maxLength={6}
            placeholder={t('create.identifierPlaceholder')}
            style={identifierError ? { borderColor: cssVar.colorError } : undefined}
            value={form.identifier}
            onPressEnter={handleCreate}
            onChange={(event) =>
              updateForm({
                identifier: event.target.value.toUpperCase(),
                identifierConflict: false,
                identifierEdited: true,
              })
            }
          />
          <Text fontSize={12} type={identifierError ? 'danger' : 'secondary'}>
            {t(
              identifierInvalid
                ? 'create.identifierInvalid'
                : identifierTaken
                  ? 'create.identifierTaken'
                  : 'create.identifierDescription',
            )}
          </Text>
        </Flexbox>
        <Flexbox gap={6}>
          <Text fontSize={13} weight={500}>
            {t('create.slugLabel')}
          </Text>
          <Input
            aria-invalid={!slugValid}
            maxLength={100}
            placeholder={t('create.slugPlaceholder')}
            style={slugValid ? undefined : { borderColor: cssVar.colorError }}
            value={form.slug}
            onPressEnter={handleCreate}
            onChange={(event) =>
              updateForm({ slug: event.target.value.toLowerCase(), slugEdited: true })
            }
          />
          <Text fontSize={12} type={slugValid ? 'secondary' : 'danger'}>
            {t(slugValid ? 'create.slugDescription' : 'create.slugInvalid')}
          </Text>
        </Flexbox>
      </Flexbox>
      <ModalFooter>
        <Button onClick={close}>{t('cancel', { ns: 'common' })}</Button>
        <Button
          disabled={!createInput || identifierTaken}
          loading={form.loading}
          type="primary"
          onClick={handleCreate}
        >
          {t('create.action')}
        </Button>
      </ModalFooter>
    </>
  );
});

export default CreateProjectContent;
