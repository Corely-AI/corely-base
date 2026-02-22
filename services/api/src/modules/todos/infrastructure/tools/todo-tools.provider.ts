import { Provider } from "@nestjs/common";
import { COPILOT_TOOLS } from "../../../ai-copilot/application/ports/tool-registry.port";
import { DomainToolPort } from "../../../ai-copilot/application/ports/domain-tool.port";
import {
  TodoSearchToolSchema,
  TodoCreateToolSchema,
  TodoUpdateToolSchema,
  TodoCompleteToolSchema,
  TodoReopenToolSchema,
  TodoDeleteToolSchema,
} from "@corely/contracts";
import { ListTodosUseCase } from "../../application/use-cases/list-todos.usecase";
import { CreateTodoUseCase } from "../../application/use-cases/create-todo.usecase";
import { UpdateTodoUseCase } from "../../application/use-cases/update-todo.usecase";
import { CompleteTodoUseCase } from "../../application/use-cases/complete-todo.usecase";
import { ReopenTodoUseCase } from "../../application/use-cases/reopen-todo.usecase";
import { DeleteTodoUseCase } from "../../application/use-cases/delete-todo.usecase";

export const TODO_TOOLS_PROVIDER: Provider = {
  provide: COPILOT_TOOLS,
  useFactory: (
    listTodos: ListTodosUseCase,
    createTodo: CreateTodoUseCase,
    updateTodo: UpdateTodoUseCase,
    completeTodo: CompleteTodoUseCase,
    reopenTodo: ReopenTodoUseCase,
    deleteTodo: DeleteTodoUseCase
  ): DomainToolPort[] => {
    return [
      {
        name: "todo.search",
        description:
          "Search for todo items by title or description. Can filter by status (open, done).",
        inputSchema: TodoSearchToolSchema,
        kind: "server",
        needsApproval: false,
        execute: async ({ tenantId, input }) => {
          const { q, status, limit } = input as any;
          return listTodos.execute(tenantId, { q, status, pageSize: limit });
        },
      },
      {
        name: "todo.create",
        description:
          "Create a new todo item. ALWAYS ask for confirmation if creating a mutation unless explicitly told to skip.",
        inputSchema: TodoCreateToolSchema,
        kind: "server",
        needsApproval: true,
        execute: async ({ tenantId, workspaceId, input }) => {
          return createTodo.execute({ ...(input as any), tenantId, workspaceId });
        },
      },
      {
        name: "todo.update",
        description: "Update an existing todo item's title, description, priority, or due date.",
        inputSchema: TodoUpdateToolSchema,
        kind: "server",
        needsApproval: true,
        execute: async ({ tenantId, input }) => {
          const { id, ...data } = input as any;
          return updateTodo.execute(tenantId, id, data);
        },
      },
      {
        name: "todo.complete",
        description: "Mark a todo item as completed.",
        inputSchema: TodoCompleteToolSchema,
        kind: "server",
        needsApproval: true,
        execute: async ({ tenantId, input }) => {
          const { id } = input as any;
          return completeTodo.execute(tenantId, id);
        },
      },
      {
        name: "todo.reopen",
        description: "Reopen a completed todo item.",
        inputSchema: TodoReopenToolSchema,
        kind: "server",
        needsApproval: true,
        execute: async ({ tenantId, input }) => {
          const { id } = input as any;
          return reopenTodo.execute(tenantId, id);
        },
      },
      {
        name: "todo.delete",
        description: "Delete a todo item permanently.",
        inputSchema: TodoDeleteToolSchema,
        kind: "server",
        needsApproval: true,
        execute: async ({ tenantId, input }) => {
          const { id } = input as any;
          return deleteTodo.execute(tenantId, id);
        },
      },
    ];
  },
  inject: [
    ListTodosUseCase,
    CreateTodoUseCase,
    UpdateTodoUseCase,
    CompleteTodoUseCase,
    ReopenTodoUseCase,
    DeleteTodoUseCase,
  ],
  multi: true,
} as any;
