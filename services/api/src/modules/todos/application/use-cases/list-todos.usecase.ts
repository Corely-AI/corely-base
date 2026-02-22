import { Inject, Injectable } from "@nestjs/common";
import type { TodoDto, TodoListQuery, TodoListResponse } from "@corely/contracts";
import { TODO_REPOSITORY_PORT, type TodoRepositoryPort } from "../ports/todo-repository.port";
import { Todo } from "../../domain/todo.entity";

@Injectable()
export class ListTodosUseCase {
  constructor(
    @Inject(TODO_REPOSITORY_PORT)
    private readonly repository: TodoRepositoryPort
  ) {}

  async execute(tenantId: string, query: TodoListQuery): Promise<TodoListResponse> {
    const { items, total } = await this.repository.list(tenantId, query);

    return {
      items: items.map((todo) => this.mapToDto(todo)),
      pageInfo: {
        page: query.page || 1,
        pageSize: query.pageSize || 50,
        total,
        hasNextPage: (query.page || 1) * (query.pageSize || 50) < total,
      },
    };
  }

  private mapToDto(todo: Todo): TodoDto {
    return {
      id: todo.id,
      tenantId: todo.tenantId,
      workspaceId: todo.workspaceId || undefined,
      title: todo.title,
      description: todo.description,
      status: todo.status,
      priority: todo.priority,
      dueDate: todo.dueDate?.toISOString() || null,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
    };
  }
}
