import { Module, NestModule, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { EnvModule } from "@corely/config";
import { DataModule } from "@corely/data";
import { AppController } from "./app.controller";
import { PlatformModule } from "./modules/platform";
import { IdentityModule } from "./modules/identity";
import { PlatformEntitlementsModule } from "./modules/platform-entitlements/platform-entitlements.module";
import { WorkspacesModule } from "./modules/workspaces";
import { TraceIdMiddleware } from "./shared/trace/trace-id.middleware";
import { TraceIdService } from "./shared/trace/trace-id.service";
import { RequestContextInterceptor } from "./shared/request-context";
import { PublicWorkspacePathMiddleware, PublicWorkspaceResolver } from "./shared/public";
import { AiCopilotModule } from "./modules/ai-copilot/ai-copilot.module";
import { TodoModule } from "./modules/todos/todos.module";

@Module({
  controllers: [AppController],
  providers: [
    TraceIdService,
    PublicWorkspaceResolver,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
  ],
  imports: [
    // Config must be first to validate env before other modules use it
    EnvModule.forRoot(),
    // DataModule must be imported for global providers (OUTBOX_PORT, AUDIT_PORT, etc.)
    DataModule,
    IdentityModule,
    PlatformModule,
    PlatformEntitlementsModule,
    WorkspacesModule,
    AiCopilotModule,
    TodoModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PublicWorkspacePathMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL }); // <- important
  }
}
