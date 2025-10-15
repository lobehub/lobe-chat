# Store Testing Coverage

## Current Status

**Overall Coverage**: 74.24% (83 test files, 1027 tests) 🎯

**Breakdown:**

- Statements: 74.24%
- Branches: 84.76%
- Functions: 48.18%
- Lines: 74.24%
- Test Files: 83 passed (83)
- Tests: 1027 passed (1027 total)

**Action Files Coverage**: 29/40 tested (72.5%)

## Coverage Status by Priority

### 🔴 High Priority - Missing Tests (>200 LOC)

| File                                | LOC | Priority     | Notes                      |
| ----------------------------------- | --- | ------------ | -------------------------- |
| `tool/slices/mcpStore/action.ts`    | 624 | **Critical** | MCP store (largest file)   |
| `file/slices/fileManager/action.ts` | 205 | **High**     | File management operations |

### 🟡 Medium Priority - Missing Tests (50-150 LOC)

| File                                     | LOC   | Priority | Notes                 |
| ---------------------------------------- | ----- | -------- | --------------------- |
| `discover/slices/assistant/action.ts`    | \~120 | Medium   | Assistant discovery   |
| `knowledgeBase/slices/crud/action.ts`    | \~110 | Medium   | KB CRUD operations    |
| `discover/slices/provider/action.ts`     | \~100 | Medium   | Provider discovery    |
| `aiInfra/slices/aiModel/action.ts`       | \~100 | Medium   | AI model management   |
| `discover/slices/model/action.ts`        | \~95  | Medium   | Model discovery       |
| `file/slices/upload/action.ts`           | \~90  | Medium   | File upload handling  |
| `file/slices/chunk/action.ts`            | \~85  | Medium   | File chunk operations |
| `chat/slices/thread/action.ts`           | \~80  | Medium   | Thread management     |
| `knowledgeBase/slices/content/action.ts` | \~75  | Medium   | KB content management |

## Testing Strategy

### 1. Zustand Store Action Testing Pattern

All store action tests should follow the patterns documented in:

- **Main Guide**: `@.cursor/rules/testing-guide/zustand-store-action-test.mdc`

Key principles:

- **Test Layering**: Only spy on direct dependencies, never cross layers
- **Per-Test Mocking**: Spy on-demand in each test, avoid global mocks
- **Act Wrapping**: Always wrap state updates with `act()`
- **Type Safety**: Ensure mock return types match actual service responses

### 2. Testing Checklist

For each action file, ensure:

- [ ] Basic action tests (validation, main flow, error handling)
- [ ] Service integration tests (mocked)
- [ ] State update tests
- [ ] Selector tests (if complex selectors exist)
- [ ] Edge cases and boundary conditions
- [ ] Loading/abort state management
- [ ] Type safety (no @ts-expect-error unless necessary)

### 3. Store Organization Patterns

**Pattern 1: Simple Action File**

```
store/domain/slices/feature/
  ├── action.ts
  ├── action.test.ts
  ├── selectors.ts
  └── selectors.test.ts
```

**Pattern 2: Complex Actions (Subdirectory)**

```
store/domain/slices/feature/
  ├── actions/
  │   ├── __tests__/
  │   │   ├── action1.test.ts
  │   │   └── action2.test.ts
  │   ├── action1.ts
  │   ├── action2.ts
  │   └── index.ts
  └── selectors/
```

## Complete Testing Workflow

**IMPORTANT**: Follow this complete workflow for every testing task. ALL steps are REQUIRED.

### Step 0: Identify Missing Tests

```bash
# List all action files without tests
for file in $(find src/store -name "action.ts" | grep -v test | sort); do
  testfile="${file%.ts}.test.ts"
  if [ ! -f "$testfile" ]; then
    echo "❌ $file"
  fi
done
```

### Step 1: Development and Testing

```bash
# 1. Write tests following the testing guide
# 2. Run tests to verify they pass
bunx vitest run --silent='passed-only' 'src/store/[domain]/slices/[slice]/action.test.ts'

# For actions in subdirectories:
bunx vitest run --silent='passed-only' 'src/store/[domain]/slices/[slice]/actions/__tests__/[action].test.ts'
```

### Step 2: Type and Lint Checks

**CRITICAL**: Run type check and lint before proceeding. Failing these checks means the task is incomplete.

```bash
# Check TypeScript types (from project root)
bun run type-check

# Fix any linting issues
bunx eslint src/store/[domain]/ --fix
```

**Common Type Errors to Watch For:**

- Missing or incorrect type annotations
- Unused variables or imports
- Incorrect generic type parameters
- Mock type mismatches

**Do NOT proceed to Step 3 if type/lint checks fail!**

### Step 3: Run Coverage Report

```bash
# Run coverage to get updated metrics
bunx vitest run --coverage 'src/store'
```

### Step 4: Summarize Development Work

Before updating documentation, create a summary of what was accomplished:

**Summary Checklist:**

- [ ] What store/slice was worked on?
- [ ] What was the coverage improvement? (before% → after%)
- [ ] How many new tests were added?
- [ ] What specific features/logic were tested?
- [ ] Were any bugs discovered and fixed?
- [ ] Any new patterns or best practices identified?

**Example Summary:**

```
Store: chat/slices/aiChat
Coverage: 65% → 82% (+17%)
Tests Added: 52 new tests
Features Tested:
  - Message streaming with tool calls
  - RAG integration and chunk retrieval
  - Error handling for API failures
  - Abort controller management
Bugs Fixed: None
Guide Updates: Added streaming response mocking pattern
```

### Step 5: Update This Document

Based on your development summary, update the following sections:

1. **Current Status** section:
   - Update overall coverage percentage
   - Update test file count and total test count

2. **Coverage Status by Priority** section:
   - Move completed actions from missing tests to "Has Tests" section
   - Update the count of files with/without tests

3. **Completed Work** section:
   - Add newly tested actions to the list
   - Document coverage improvements
   - Document any bugs fixed

### Step 6: Final Verification

```bash
# Verify all tests still pass
bunx vitest run 'src/store'

# Verify type check still passes
bun run type-check
```

### Complete Workflow Example

```bash
# 1. Development Phase
# ... write code and tests ...
bunx vitest run --silent='passed-only' 'src/store/tool/slices/mcpStore/action.test.ts'

# 2. Type/Lint Phase (REQUIRED)
bun run type-check # Must pass!
bunx eslint src/store/tool/ --fix

# 3. Coverage Phase
bunx vitest run --coverage 'src/store'

# 4. Summarization Phase
# Create summary following the checklist above

# 5. Documentation Phase
# Update this file with summary and metrics

# 6. Final Verification
bunx vitest run 'src/store'
bun run type-check

# 7. Commit
git add .
git commit -m "✅ test: add comprehensive tests for mcpStore actions"
```

**Remember**: A testing task is only complete when:

1. ✅ Tests pass
2. ✅ Type check passes
3. ✅ Lint passes
4. ✅ Development work is summarized
5. ✅ Documentation is updated
6. ✅ Final verification passes

## Commands

### Testing Commands

```bash
# Run all store tests
bunx vitest run 'src/store'

# Run all store tests with coverage
bunx vitest run --coverage 'src/store'

# Run specific store tests
bunx vitest run --silent='passed-only' 'src/store/[domain]/**/*.test.ts'

# Run specific action tests
bunx vitest run --silent='passed-only' 'src/store/[domain]/slices/[slice]/action.test.ts'

# Watch mode for development
bunx vitest watch 'src/store/[domain]/slices/[slice]/action.test.ts'
```

### Type Check Commands

```bash
# Type check entire project (from project root)
bun run type-check

# Watch mode
bunx tsc --noEmit --watch
```

### Lint Commands

```bash
# Lint specific store
bunx eslint src/store/[domain]/ --fix

# Lint all stores
bunx eslint src/store/ --fix

# Lint without auto-fix (check only)
bunx eslint src/store/[domain]/
```

## Completed Work

### Recent Achievements ✅

**Session (2024-10-15)**: ✅ Discover Store Testing Complete

- **Coverage**: 74.24% overall (+26 tests, 2 new test files)
- **New Test Files**:
  - `discover/slices/plugin/action.test.ts` - 15 tests covering plugin discovery (SWR hooks)
  - `discover/slices/mcp/action.test.ts` - 11 tests covering MCP discovery (SWR hooks)
- **Features Tested**:
  - Plugin categories, detail, identifiers, and list fetching
  - MCP categories, detail, and list fetching
  - SWR key generation with locale and parameters
  - SWR configuration verification
  - Service integration with discoverService
- **Testing Patterns**:
  - Successfully adapted zustand testing patterns for SWR hooks
  - Mock strategy: Synchronously return data from mock useSWR
  - Type safety: Used `as any` for test mock data where needed
- **Type Safety**: All tests pass type-check
- **Action Files Coverage**: 29/40 tested (72.5%, +2 files)

**Session (2024-10-14)**: 📋 Store Testing Documentation Created

- Created comprehensive test coverage tracking document
- Analyzed 40 action files across 13 stores
- Identified 15 files without tests (37.5%)
- Prioritized by complexity (LOC): 15 files from 624 LOC (mcpStore) to 27 LOC (content)
- Documented testing patterns and workflow
- Ready for systematic test development

**Previous Work**:

- 25 action files already have comprehensive tests (62.5% coverage)
- 742 tests written across 80 test files
- Well-tested stores: agent, chat (partial), file (partial), image, session, tool, user, global, aiInfra (partial)
- Following zustand testing best practices from `@.cursor/rules/testing-guide/zustand-store-action-test.mdc`

## Notes

### General Testing Notes

- All store actions should follow the Zustand testing pattern for consistency
- Test layering principle: Only spy on direct dependencies
- Per-test mocking: Avoid global spy pollution in beforeEach
- Always use `act()` wrapper for state updates
- Mock return types must match actual service types
- **Type check and lint must pass before committing**
- **Update this document after each testing task completion**

### Store-Specific Notes

- **chat/aiChat**: Complex streaming logic, requires careful mocking of chatService
- **tool/mcpStore**: Largest file (624 LOC), needs comprehensive test coverage
- **discover/**\*: Similar patterns, can reuse test templates across slices
- **aiInfra**: Some tests exist in **tests**/ subdirectories
- **global**: Has action tests in actions/ subdirectory structure
