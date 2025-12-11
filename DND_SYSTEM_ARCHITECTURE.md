# Drag and Drop System Architecture

## Overview

The application uses `@dnd-kit/core` to implement a drag-and-drop system for organizing files and folders in the Resource Manager. The system supports moving files/folders between folders, multi-file selection, and provides visual feedback during drag operations.

## Architecture Components

### 1. DndContextWrapper (`src/app/[variants]/(main)/resource/features/DndContextWrapper.tsx`)

The central orchestrator of the DND system. It wraps the entire Resource Manager and provides:

**Key Features:**
- **Custom Collision Detection**: Prioritizes specific folders over root drop zones to prevent accidental drops
- **Drag State Context**: Tracks whether a drag is currently active via `DragActiveContext`
- **Drag Overlay**: Shows a custom preview with file icon, name, and selection count
- **Multi-file Support**: Handles dragging multiple selected files simultaneously
- **File Type Awareness**: Distinguishes between documents and regular files for proper store actions

**Collision Detection Strategy:**
```typescript
customCollisionDetection: CollisionDetection = (args) => {
  // 1. Try pointerWithin for precise detection
  // 2. Filter out root targets if non-root targets exist
  // 3. Skip expensive computations for performance
}
```

**Drag Flow:**
1. `handleDragStart`: Stores active item ID and data
2. User drags over droppable zones
3. `handleDragEnd`:
   - Determines target folder (or null for root)
   - Collects items to move (single or multi-select)
   - Calls appropriate store action (`updateDocument` or `moveFileToFolder`)
   - Clears selection if moving multiple files

### 2. Draggable Components

All draggable components implement both `useDraggable` and `useDroppable` hooks (for folders):

#### ListView/ListItem (`src/features/ResourceManager/components/Explorer/ListView/ListItem/index.tsx`)
- **View Type**: Table/list view with rows
- **Draggable**: All files and folders
- **Droppable**: Folders only
- **Visual States**:
  - `isDragging`: Semi-transparent (0.5 opacity)
  - `isOver`: Inverted colors (text background, background text)
- **Features**:
  - Checkbox selection
  - Inline folder renaming
  - Context menu

#### MasonryView/MasonryFileItem (`src/features/ResourceManager/components/Explorer/MasonryView/MasonryFileItem/index.tsx`)
- **View Type**: Card-based masonry grid
- **Draggable**: All files and folders
- **Droppable**: Folders only
- **Visual States**: Same as ListView
- **Features**:
  - Rich previews for images, markdown, notes
  - Lazy loading with Intersection Observer
  - Different card styles based on file type

#### Tree/FileTreeItem (`src/features/ResourceManager/components/Tree/index.tsx`)
- **View Type**: Hierarchical tree sidebar
- **Draggable**: All files and folders
- **Droppable**: Folders only
- **Features**:
  - Expandable/collapsible folders
  - Lazy loading of folder contents
  - Persistent expansion state
  - Inline folder renaming

### 3. Droppable Zones

#### Folder Drop Zones
Each folder in the system is a droppable zone with ID format:
- ListView: `list:{id}`
- MasonryView: `masonry:{id}`
- Tree: `tree:{id}`

**Drop Data Structure:**
```typescript
{
  fileType: string,
  isFolder: boolean,
  name: string,
  sourceType?: string,
  targetId: string  // The folder ID to drop into
}
```

#### Root Drop Zone (LibraryHead)
The library header acts as a root drop zone to move items back to the library root:
- **ID Format**: `__root__:{libraryId}`
- **Target ID**: `null` (represents root level)
- **Purpose**: Allows users to move files/folders out of nested folders

Located at: `src/app/[variants]/(main)/resource/library/_layout/Header/LibraryHead.tsx`

### 4. Performance Optimizations

#### useDragActive Hook
```typescript
export const useDragActive = () => useContext(DragActiveContext);
```

**Purpose**: Conditionally enable droppable zones only during active drag operations

**Implementation Pattern:**
```typescript
const isDragActive = useDragActive();
const { setNodeRef, isOver } = useDroppable({
  disabled: !isFolder || !isDragActive,  // Only active for folders during drag
  id: droppableId,
});
```

**Benefits:**
- Reduces CPU usage when not dragging
- Prevents unnecessary collision calculations
- Improves scrolling performance in large lists

#### Custom Collision Detection
- Uses `pointerWithin` for precise detection
- Filters out root targets when child folders are available
- Skips expensive `rectIntersection` and `closestCorners` on large lists
- Returns empty array by default to keep drag smooth

#### Lazy Loading in Tree
- Folders load children only when expanded
- Uses SWR for caching and deduplication
- Shares cache with Explorer component
- Persists expansion state across re-renders

## Data Flow

### Drag and Drop Flow

```
┌─────────────────┐
│  User starts    │
│  dragging item  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  DndContextWrapper          │
│  handleDragStart            │
│  - Sets activeId            │
│  - Sets activeData          │
│  - Updates DragActiveContext│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  All droppables activate    │
│  (via useDragActive hook)   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  User hovers over folder    │
│  - isOver = true            │
│  - Visual feedback shown    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  User releases              │
│  DndContextWrapper          │
│  handleDragEnd              │
└────────┬────────────────────┘
         │
         ├─────────────────────┐
         ▼                     ▼
  ┌──────────────┐      ┌──────────────┐
  │  Document?   │      │  Regular     │
  │ updateDoc()  │      │  File?       │
  │              │      │ moveFile()   │
  └──────────────┘      └──────────────┘
         │                     │
         └──────────┬──────────┘
                    ▼
         ┌────────────────────┐
         │  Clear selection   │
         │  (if multi-select) │
         └────────────────────┘
```

### Store Integration

**File Store Actions:**
- `moveFileToFolder(fileId, targetParentId)` - Move regular files
- `updateDocument(docId, { parentId })` - Move documents/pages

**Resource Manager Store:**
- `selectedFileIds` - Tracks multi-selection
- `setSelectedFileIds([])` - Clears selection after move

## Component Reference Node Pattern

All draggable/droppable components use a combined ref pattern:

```typescript
const {
  setNodeRef: setDraggableRef,
  // ... other draggable props
} = useDraggable({ id, data });

const {
  setNodeRef: setDroppableRef,
  // ... other droppable props
} = useDroppable({
  id: droppableId,
  disabled: !isFolder || !isDragActive
});

// Combine refs
const setNodeRef = (node: HTMLElement | null) => {
  setDraggableRef(node);
  setDroppableRef(node);
};

return <div ref={setNodeRef} {...attributes} {...listeners}>
```

## File Type Handling

### Document Detection
```typescript
const isDocument =
  itemData.sourceType === 'document' ||
  itemData.fileType === 'custom/document' ||
  itemData.fileType === 'custom/folder';
```

### Folder Detection
```typescript
const isFolder = fileType === 'custom/folder';
```

### Action Routing
- **Documents**: Use `updateDocument` (updates `parentId` field)
- **Files**: Use `moveFileToFolder` (moves to different folder)
- **Folders**: Treated as documents, use `updateDocument`

## Visual Feedback

### Drag Overlay
Located in DndContextWrapper, rendered via `createPortal`:
- File/folder icon (or emoji for pages)
- File name (truncated)
- Selection count badge (if multiple selected)
- Styled with elevated background and primary border
- Fixed dimensions: height 44px, width 200-320px

### Dragging State
Applied to source element:
```css
.dragging {
  opacity: 0.5;
}
```

### Drop Target State
Applied to valid drop targets:
```css
.dragOver {
  color: colorBgElevated !important;
  background-color: colorText !important;
}
```

## Edge Cases and Validations

### Prevented Operations
1. **Self-drop**: Cannot drop item into itself
2. **Non-folder drop**: Cannot drop on regular files (only folders)
3. **Same location**: No action if dropped in same parent
4. **Missing item**: Gracefully handles items not in fileList (uses active.data fallback)

### Multi-selection Logic
```typescript
const isDraggingSelection = selectedFileIds.includes(active.id);
const itemsToMove = isDraggingSelection ? selectedFileIds : [active.id];
```

When dragging a selected item, all selected items move together.

### Root Drop Detection
```typescript
const isRootDrop = typeof over.id === 'string' &&
                   (over.id as string).startsWith('__root__:');
const targetParentId = isRootDrop ? null : overData.targetId;
```

## Activation Constraints

Pointer sensor requires 8px movement before drag starts:
```typescript
useSensor(PointerSensor, {
  activationConstraint: {
    distance: 8,
  },
})
```

This prevents accidental drags when clicking to select items.

## Integration Points

### Where DndContext is Mounted
The `DndContextWrapper` should wrap the entire resource manager UI where drag-and-drop is needed. Currently mounted in the resource layout.

### Shared State Requirements
- **File Store**: Access to `fileList`, `moveFileToFolder`, `updateDocument`
- **Resource Manager Store**: Access to `selectedFileIds`, `setSelectedFileIds`
- **Knowledge Base Store**: For library/folder navigation

## Testing Considerations

When testing DND functionality:
1. Test single file/folder drag
2. Test multi-select drag
3. Test drop into folder
4. Test drop into root
5. Test prevention of invalid drops
6. Test visual feedback states
7. Test with different view modes (List, Masonry, Tree)
8. Test lazy loading in Tree during drag
9. Test performance with large file lists

## Future Enhancements

Potential improvements to consider:
- Drag to reorder files within same folder
- Drag from external sources (desktop files)
- Undo/redo for move operations
- Bulk move progress indicator
- Drag multiple folders simultaneously
- Copy instead of move (with modifier key)
