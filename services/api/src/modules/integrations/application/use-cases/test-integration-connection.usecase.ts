import { Injectable } from "@nestjs/common";
import type {
  TestIntegrationConnectionInput,
  TestIntegrationConnectionOutput,
} from "@corely/contracts";
import {
  BaseUseCase,
  NoopLogger,
  RequireTenant,
  ok,
  type Result,
  type UseCaseContext,
  type UseCaseError,
} from "@corely/kernel";
import { IntegrationConnectionResolverService } from "../services/integration-connection-resolver.service";
import { IntegrationProviderRegistryService } from "../services/integration-provider-registry.service";

@RequireTenant()
@Injectable()
export class TestIntegrationConnectionUseCase extends BaseUseCase<
  TestIntegrationConnectionInput,
  TestIntegrationConnectionOutput
> {
  constructor(
    private readonly resolver: IntegrationConnectionResolverService,
    private readonly providers: IntegrationProviderRegistryService
  ) {
    super({ logger: new NoopLogger() });
  }

  protected async handle(
    input: TestIntegrationConnectionInput,
    ctx: UseCaseContext
  ): Promise<Result<TestIntegrationConnectionOutput, UseCaseError>> {
    const resolved = await this.resolver.resolveById(ctx.tenantId!, input.id);

    return ok(await this.providers.testConnection(resolved.connection, resolved.secret));
  }
}
