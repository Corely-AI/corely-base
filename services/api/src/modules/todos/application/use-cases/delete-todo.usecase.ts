import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { TODO_REPOSITORY_PORT, TodoRepositoryPort } from "../ports/todo-repository.port";

@Injectable()
export class DeleteTodoUseCase {
  constructor(
    @Inject(TODO_REPOSITORY_PORT)
    private readonly repository: TodoRepositoryPort
  ) {}

  async execute(tenantId: string, id: string): Promise<void> {
    const todo = await this.repository.findById(tenantId, id);
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    await this.repository.delete(tenantId, id);
  }
}
