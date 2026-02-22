import { Module } from "@nestjs/common";
import { DataModule } from "@corely/data";
import { IdentityModule } from "../identity/identity.module";
import { TodoController } from "./http/todo.controller";
import { TODO_REPOSITORY_PORT } from "./application/ports/todo-repository.port";
import { PrismaTodoRepository } from "./infrastructure/adapters/prisma-todo-repository.adapter";
import { CreateTodoUseCase } from "./application/use-cases/create-todo.usecase";
import { UpdateTodoUseCase } from "./application/use-cases/update-todo.usecase";
import { GetTodoUseCase } from "./application/use-cases/get-todo.usecase";
import { ListTodosUseCase } from "./application/use-cases/list-todos.usecase";
import { DeleteTodoUseCase } from "./application/use-cases/delete-todo.usecase";
import { CompleteTodoUseCase } from "./application/use-cases/complete-todo.usecase";
import { ReopenTodoUseCase } from "./application/use-cases/reopen-todo.usecase";
import { TODO_TOOLS_PROVIDER } from "./infrastructure/tools/todo-tools.provider";

@Module({
  imports: [DataModule, IdentityModule],
  controllers: [TodoController],
  providers: [
    {
      provide: TODO_REPOSITORY_PORT,
      useClass: PrismaTodoRepository,
    },
    CreateTodoUseCase,
    UpdateTodoUseCase,
    GetTodoUseCase,
    ListTodosUseCase,
    DeleteTodoUseCase,
    CompleteTodoUseCase,
    ReopenTodoUseCase,
    TODO_TOOLS_PROVIDER,
  ],
  exports: [
    CreateTodoUseCase,
    UpdateTodoUseCase,
    GetTodoUseCase,
    ListTodosUseCase,
    DeleteTodoUseCase,
    CompleteTodoUseCase,
    ReopenTodoUseCase,
  ],
})
export class TodoModule {}
