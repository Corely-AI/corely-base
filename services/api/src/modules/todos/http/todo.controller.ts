import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import type { Request } from "express";
import {
  CreateTodoInputSchema,
  UpdateTodoInputSchema,
  TodoListQuerySchema,
} from "@corely/contracts";
import { CreateTodoUseCase } from "../application/use-cases/create-todo.usecase";
import { ListTodosUseCase } from "../application/use-cases/list-todos.usecase";
import { GetTodoUseCase } from "../application/use-cases/get-todo.usecase";
import { UpdateTodoUseCase } from "../application/use-cases/update-todo.usecase";
import { DeleteTodoUseCase } from "../application/use-cases/delete-todo.usecase";
import { CompleteTodoUseCase } from "../application/use-cases/complete-todo.usecase";
import { ReopenTodoUseCase } from "../application/use-cases/reopen-todo.usecase";
import { AuthGuard } from "../../identity/adapters/http/auth.guard";
import { toUseCaseContext } from "../../../shared/request-context/usecase-context";
import { IdempotencyInterceptor } from "../../../shared/infrastructure/idempotency/IdempotencyInterceptor";

@Controller("todos")
@UseGuards(AuthGuard)
@UseInterceptors(IdempotencyInterceptor)
export class TodoController {
  constructor(
    private readonly createTodo: CreateTodoUseCase,
    private readonly listTodos: ListTodosUseCase,
    private readonly getTodo: GetTodoUseCase,
    private readonly updateTodo: UpdateTodoUseCase,
    private readonly deleteTodo: DeleteTodoUseCase,
    private readonly completeTodo: CompleteTodoUseCase,
    private readonly reopenTodo: ReopenTodoUseCase
  ) {}

  @Post()
  async create(@Body() body: unknown, @Req() req: Request) {
    const input = CreateTodoInputSchema.parse(body);
    const ctx = toUseCaseContext(req as any);
    return this.createTodo.execute({
      ...input,
      tenantId: ctx.tenantId!,
      workspaceId: ctx.workspaceId,
    });
  }

  @Get()
  async list(@Query() query: unknown, @Req() req: Request) {
    const input = TodoListQuerySchema.parse(query);
    const ctx = toUseCaseContext(req as any);
    return this.listTodos.execute(ctx.tenantId!, input);
  }

  @Get(":id")
  async getById(@Param("id") id: string, @Req() req: Request) {
    const ctx = toUseCaseContext(req as any);
    return this.getTodo.execute(ctx.tenantId!, id);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: unknown, @Req() req: Request) {
    const input = UpdateTodoInputSchema.parse(body);
    const ctx = toUseCaseContext(req as any);
    return this.updateTodo.execute(ctx.tenantId!, id, input);
  }

  @Delete(":id")
  async delete(@Param("id") id: string, @Req() req: Request) {
    const ctx = toUseCaseContext(req as any);
    await this.deleteTodo.execute(ctx.tenantId!, id);
    return { success: true };
  }

  @Post(":id/complete")
  async complete(@Param("id") id: string, @Req() req: Request) {
    const ctx = toUseCaseContext(req as any);
    return this.completeTodo.execute(ctx.tenantId!, id);
  }

  @Post(":id/reopen")
  async reopen(@Param("id") id: string, @Req() req: Request) {
    const ctx = toUseCaseContext(req as any);
    return this.reopenTodo.execute(ctx.tenantId!, id);
  }
}
