const content = `# lh workspace - Workspaces and Command Scope

A workspace is a shared team space with its own agents, topics, documents, knowledge
bases, tasks and members. Every \`lh\` command runs against exactly one scope: the
user's **personal** content, or **one workspace**. The same id can exist in one scope
and be "not found" in the other.

## "Workspace" means different things

When the user says "my workspace", work out which one they mean before reading:

| They may mean | Where it lives | How to reach it |
|---------------|----------------|-----------------|
| A team workspace | \`lh workspace\` | \`lh workspace current\` / \`lh workspace list\` |
| Your own documents | Agent documents (the documents tool, or \`lh doc\`) | Default for "my notes / my reports" |
| A task's pinned documents | \`lh task doc\` | Only inside a task run |
| The local working directory | The device shell | Only when a device is connected |

If the request fits more than one row and the first place you check has nothing
matching, say what you checked and ask. Do not report "not found" after looking in one scope.

## Commands

- \`lh workspace current [--json]\` - Show the scope commands run under, and where it came from
- \`lh workspace list [--json]\` - List workspaces you belong to (id, name, slug, role, plan)
- \`lh workspace view [workspaceId] [--json]\` - View workspace detail (defaults to the active scope)
- \`lh workspace members [-w <id>] [--json]\` - List workspace members
- \`lh workspace stats [-w <id>] [--mine] [--json]\` - Content statistics (admin or higher; \`--mine\` works for every member)
- \`lh workspace usage [-w <id>] [--since <date>] [--until <date>] [--json]\` - Credit usage for the current billing window
- \`lh workspace settings [-w <id>] [--json]\` - Show the workspace settings blob
- \`lh workspace create <name> -s <slug> [-d <desc>] [--avatar <url|emoji>] [--use]\` - Create a workspace
- \`lh workspace update [-w <id>] [-n <name>] [-s <slug>] [-d <desc>] [--avatar <url|emoji>]\` - Update the profile (admin or higher)
- \`lh workspace invite <email> [-w <id>] [-r admin|member|viewer]\` - Invite a member (admin or higher)
- \`lh workspace invitations [-w <id>]\` - List pending invitations (admin or higher)
- \`lh workspace audit-log [-w <id>] [--action <a>] [--resource-type <t>] [-q <text>] [--start <date>] [--end <date>] [-L <n>]\` - Audit log (admin or higher, Business plan)

\`-w\` only changes which workspace these \`lh workspace\` subcommands read. It does not
change the scope of other modules.

## Scope rules for agent runs

- Your run already carries its scope. A run started in a workspace is pinned to that
  workspace, and a personal run is pinned to personal content. \`lh whoami\` or
  \`lh workspace current\` shows which one you are in. Check it first when something you
  expect to exist reports "not found".
- **Never run \`lh workspace use\`** from a run. It rewrites the machine's saved scope,
  which then retargets the user's own later commands, and it does not move this run anyway.
- To read a single conversation from another workspace, \`lh topic view <id> --workspace <workspaceId>\`
  and \`lh topic export <id> --workspace <workspaceId>\` take an explicit workspace.
  For anything else in another workspace, tell the user which workspace holds it and
  ask them to continue from an agent in that workspace. Do not try other ways to switch scope.
- Role-gated commands (admin or higher) fail with a permission error for members. Report
  that error as it is. Do not retry with other flags.
`;

export default content;
