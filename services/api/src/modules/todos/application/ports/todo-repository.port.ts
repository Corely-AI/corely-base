import { Todo } from "../../domain/todo.entity";
import { TodoListQuery } from "@corely/contracts";

export const TODO_REPOSITORY_PORT = Symbol("TODO_REPOSITORY_PORT");

export interface TodoRepositoryPort {
  findById(tenantId: string, id: string): Promise<Todo | null>;
  save(todo: Todo): Promise<void>;
  delete(tenantId: string, id: string): Promise<void>;
  list(tenantId: string, query: TodoListQuery): Promise<{ items: Todo[]; total: number }>;
}
