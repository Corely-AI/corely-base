import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { TodoDto } from "@corely/contracts";
import { TODO_REPOSITORY_PORT, type TodoRepositoryPort } from "../ports/todo-repository.port";
import { Todo } from "../../domain/todo.entity";

@Injectable()
export class ReopenTodoUseCase {
  constructor(
    @Inject(TODO_REPOSITORY_PORT)
    private readonly repository: TodoRepositoryPort
  ) {}

  async execute(tenantId: string, id: string): Promise<TodoDto> {
    const todo = await this.repository.findById(tenantId, id);
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    todo.reopen();
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
