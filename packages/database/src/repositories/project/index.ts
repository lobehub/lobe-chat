import { createProjectCoordinatorAgentConfig } from '@lobechat/builtin-agents';

import { AgentModel } from '../../models/agent';
import type { CreateProjectInput } from '../../models/project';
import { ProjectIdentifierTakenError, ProjectModel } from '../../models/project';
import type { LobeChatDatabase } from '../../type';

/**
 * Cross-aggregate write flow for projects. Creating a project also creates its
 * coordinator agent — an `agents` row that AgentModel owns and that has its own
 * lifecycle — so the transaction spanning both aggregates lives here, while
 * {@link ProjectModel.create} owns only the project row and its coordinator link
 * row.
 */
export class ProjectRepository {
  constructor(
    private readonly db: LobeChatDatabase,
    private readonly userId: string,
    private readonly workspaceId?: string,
  ) {}

  async create(input: CreateProjectInput) {
    return this.db.transaction(async (tx) => {
      const db = tx as LobeChatDatabase;
      const projectModel = new ProjectModel(db, this.userId, this.workspaceId);

      // Fail before writing the coordinator agent when the identifier is taken.
      // The model re-checks inside its own transaction and translates the unique
      // violation, which covers the concurrent-create race.
      if (await projectModel.isIdentifierTaken(input.identifier)) {
        throw new ProjectIdentifierTakenError(input.identifier.trim().toUpperCase());
      }

      const coordinator = await new AgentModel(db, this.userId, this.workspaceId).create({
        ...createProjectCoordinatorAgentConfig({
          avatar: input.avatar,
          description: input.description,
          identifier: input.identifier.trim().toUpperCase(),
          name: input.name,
        }),
        visibility: input.visibility,
        virtual: true,
      });

      return projectModel.create({ ...input, coordinatorAgentId: coordinator.id });
    });
  }
}
