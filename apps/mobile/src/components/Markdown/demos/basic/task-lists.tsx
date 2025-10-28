import { Markdown } from '@lobehub/ui-rn';

const taskListsContent = `## Task Lists

- [x] Completed task
- [x] Another completed task
- [ ] Incomplete task
- [ ] Another incomplete task

## Project Tasks

- [x] Design UI mockups
- [x] Set up development environment
- [ ] Implement core features
  - [x] User authentication
  - [x] Data persistence
  - [ ] Real-time sync
- [ ] Write tests
- [ ] Deploy to production
`;

export default () => {
  return <Markdown>{taskListsContent}</Markdown>;
};
