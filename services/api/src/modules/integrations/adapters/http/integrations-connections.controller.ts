import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import {
  CreateIntegrationConnectionInputSchema,
  ListIntegrationConnectionsInputSchema,
  TestIntegrationConnectionInputSchema,
  UpdateIntegrationConnectionInputSchema,
} from "@corely/contracts";
import { AuthGuard } from "../../../identity/adapters/http/auth.guard";
import { buildUseCaseContext, mapResultToHttp } from "../../../../shared/http/usecase-mappers";
import type { ContextAwareRequest } from "../../../../shared/request-context";
import { IntegrationsApplication } from "../../application/integrations.application";

@Controller("integrations/connections")
@UseGuards(AuthGuard)
export class IntegrationsConnectionsController {
  constructor(private readonly app: IntegrationsApplication) {}

  @Post()
  async create(@Body() body: unknown, @Req() req: ContextAwareRequest) {
    const input = CreateIntegrationConnectionInputSchema.parse(body);
    const result = await this.app.createConnection.execute(input, buildUseCaseContext(req));
    return mapResultToHttp(result);
  }

  @Get()
  async list(@Req() req: ContextAwareRequest) {
    const input = ListIntegrationConnectionsInputSchema.parse(req.query);
    const result = await this.app.listConnections.execute(input, buildUseCaseContext(req));
    return mapResultToHttp(result);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: unknown, @Req() req: ContextAwareRequest) {
    const input = UpdateIntegrationConnectionInputSchema.parse({
      ...(body as Record<string, unknown>),
      id,
    });
    const result = await this.app.updateConnection.execute(input, buildUseCaseContext(req));
    return mapResultToHttp(result);
  }

  @Post(":id/test")
  async test(@Param("id") id: string, @Req() req: ContextAwareRequest) {
    const input = TestIntegrationConnectionInputSchema.parse({ id });
    const result = await this.app.testConnection.execute(input, buildUseCaseContext(req));
    return mapResultToHttp(result);
  }
}
