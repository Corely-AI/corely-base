import { Inject, Injectable } from "@nestjs/common";
import type {
  ListIntegrationConnectionsInput,
  ListIntegrationConnectionsOutput,
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
import {
  INTEGRATION_CONNECTION_REPOSITORY_PORT,
  type IntegrationConnectionRepositoryPort,
} from "../ports/integration-connection-repository.port";

@RequireTenant()
@Injectable()
export class ListIntegrationConnectionsUseCase extends BaseUseCase<
  ListIntegrationConnectionsInput,
  ListIntegrationConnectionsOutput
> {
  constructor(
    @Inject(INTEGRATION_CONNECTION_REPOSITORY_PORT)
    private readonly repository: IntegrationConnectionRepositoryPort
  ) {
    super({ logger: new NoopLogger() });
  }

  protected async handle(
    input: ListIntegrationConnectionsInput,
    ctx: UseCaseContext
  ): Promise<Result<ListIntegrationConnectionsOutput, UseCaseError>> {
    const rows = await this.repository.list(ctx.tenantId!, {
      workspaceId: input.workspaceId,
      providerKey: input.providerKey,
    });

    return ok({
      items: rows.map((row) => row.toDto()),
    });
  }
}
