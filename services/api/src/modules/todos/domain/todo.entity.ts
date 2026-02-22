export type TodoStatus = "open" | "done";
export type TodoPriority = "low" | "medium" | "high";

export class Todo {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly workspaceId: string | null,
    public title: string,
    public description: string | null,
    public status: TodoStatus,
    public priority: TodoPriority,
    public dueDate: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  complete(): void {
    this.status = "done";
    this.updatedAt = new Date();
  }

  reopen(): void {
    this.status = "open";
    this.updatedAt = new Date();
  }

  update(params: {
    title?: string;
    description?: string | null;
    priority?: TodoPriority;
    dueDate?: Date | null;
    status?: TodoStatus;
  }): void {
    if (params.title !== undefined) this.title = params.title;
    if (params.description !== undefined) this.description = params.description;
    if (params.priority !== undefined) this.priority = params.priority;
    if (params.dueDate !== undefined) this.dueDate = params.dueDate;
    if (params.status !== undefined) this.status = params.status;
    this.updatedAt = new Date();
  }
}
