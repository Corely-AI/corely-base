import type { AppManifest } from "@corely/contracts";

export const todosAppManifest: AppManifest = {
  appId: "todos",
  name: "Tasks",
  tier: 1,
  version: "1.0.0",
  description: "Task management and todos",
  dependencies: [],
  capabilities: [],
  permissions: [],
  menu: [
    {
      id: "todos-list",
      scope: "web",
      section: "todos",
      labelKey: "nav.todos",
      defaultLabel: "Tasks",
      route: "/todos",
      icon: "CheckCircle2",
      order: 10,
    },
  ],
};
