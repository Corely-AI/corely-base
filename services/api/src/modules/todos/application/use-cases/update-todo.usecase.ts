import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UpdateTodoInput, TodoDto } from "@corely/contracts";
import { TODO_REPOSITORY_PORT, type TodoRepositoryPort } from "../ports/todo-repository.port";
import { Todo } from "../../domain/todo.entity";

@Injectable()
export class UpdateTodoUseCase {
  constructor(
    @Inject(TODO_REPOSITORY_PORT)
    private readonly repository: TodoRepositoryPort
  ) {}

  async execute(tenantId: string, id: string, input: UpdateTodoInput): Promise<TodoDto> {
    const todo = await this.repository.findById(tenantId, id);
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    todo.update({
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: input.status,
      dueDate: input.dueDate ? new Date(input.dueDate) : input.dueDate === null ? null : undefined,
    });

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
