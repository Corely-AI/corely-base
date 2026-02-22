import { Injectable } from "@nestjs/common";
import { PrismaService } from "@corely/data";
import { TodoRepositoryPort } from "../../application/ports/todo-repository.port";
import { Todo, TodoStatus, TodoPriority } from "../../domain/todo.entity";
import { TodoListQuery } from "@corely/contracts";

@Injectable()
export class PrismaTodoRepository implements TodoRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(tenantId: string, id: string): Promise<Todo | null> {
    const row = await this.prisma.todo.findUnique({
      where: { id, tenantId },
    });
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async save(todo: Todo): Promise<void> {
    await this.prisma.todo.upsert({
      where: { id: todo.id },
      create: {
        id: todo.id,
        tenantId: todo.tenantId,
        workspaceId: todo.workspaceId,
        title: todo.title,
        description: todo.description,
        status: todo.status,
        priority: todo.priority,
        dueDate: todo.dueDate,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt,
      },
      update: {
        workspaceId: todo.workspaceId,
        title: todo.title,
        description: todo.description,
        status: todo.status,
        priority: todo.priority,
        dueDate: todo.dueDate,
        updatedAt: todo.updatedAt,
      },
    });
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.prisma.todo.delete({
      where: { id, tenantId },
    });
  }

  async list(tenantId: string, query: TodoListQuery): Promise<{ items: Todo[]; total: number }> {
    const { page = 1, pageSize = 50, q, status, priority } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {
      tenantId,
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const [rows, total] = await Promise.all([
      this.prisma.todo.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.todo.count({ where }),
    ]);

    return {
      items: rows.map((row) => this.mapToEntity(row)),
      total,
    };
  }

  private mapToEntity(row: any): Todo {
    return new Todo(
      row.id,
      row.tenantId,
      row.workspaceId,
      row.title,
      row.description,
      row.status as TodoStatus,
      row.priority as TodoPriority,
      row.dueDate,
      row.createdAt,
      row.updatedAt
    );
  }
}
