# Calculate project statistics from the loaded project graph

## Context

The Projects overview calls `projectService.getProjects()`, which already loads the authenticated user's projects, tasks, and subtasks in three parallel repository requests and assembles a complete project graph.

The UI then calls `getProjectStats(project.id)` for every visible project. Previously each stats call invoked `getProject()` → `getProjects()` again, repeating all three repository list requests per project. An overview containing N projects therefore generated 3 + (3 × N) backend reads before rendering statistics.

## Decision

`getProjects()` caches the freshly assembled project graph in memory. `getProjectStats(projectId)` calculates statistics from that graph when available, using the exported pure `calculateProjectStats(project)` function. It falls back to loading the project only when no cached graph is available.

All project/task/subtask mutations exposed through `projectService` invalidate the cache.

## Consequences

- The normal Projects overview performs three backend graph reads regardless of project count, rather than three additional reads per project.
- Statistics remain derived from the same project/task/subtask data already used by the view.
- Direct stats calls still work when the graph has not yet been loaded.
- Mutations cannot leave a knowingly stale project graph cached through the service API.
- The persisted schema and NoCodeBackend contract are unchanged.
