import { Inject, Injectable } from "@nestjs/common";
import type { CreateTodoInput, TodoDto } from "@corely/contracts";
import { TODO_REPOSITORY_PORT, type TodoRepositoryPort } from "../ports/todo-repository.port";
import { Todo } from "../../domain/todo.entity";
import { nanoid } from "nanoid";

export type CreateTodoParams = CreateTodoInput & {
  tenantId: string;
  workspaceId?: string;
};

@Injectable()
export class CreateTodoUseCase {
  constructor(
    @Inject(TODO_REPOSITORY_PORT)
    private readonly repository: TodoRepositoryPort
  ) {}

  async execute(params: CreateTodoParams): Promise<TodoDto> {
    const todo = new Todo(
      nanoid(),
      params.tenantId,
      params.workspaceId || null,
      params.title,
      params.description || null,
      "open",
      params.priority || "medium",
      params.dueDate ? new Date(params.dueDate) : null,
      new Date(),
      new Date()
    );

    await this.repository.save(todo);

    return this.mapToDto(todo);
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
