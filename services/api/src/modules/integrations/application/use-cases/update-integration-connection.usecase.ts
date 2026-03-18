import { Inject, Injectable } from "@nestjs/common";
import type {
  UpdateIntegrationConnectionInput,
  UpdateIntegrationConnectionOutput,
} from "@corely/contracts";
import {
  BaseUseCase,
  NoopLogger,
  NotFoundError,
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
import { IntegrationSecretsService } from "../../infrastructure/secrets/integration-secrets.service";

@RequireTenant()
@Injectable()
export class UpdateIntegrationConnectionUseCase extends BaseUseCase<
  UpdateIntegrationConnectionInput,
  UpdateIntegrationConnectionOutput
> {
  constructor(
    @Inject(INTEGRATION_CONNECTION_REPOSITORY_PORT)
    private readonly repository: IntegrationConnectionRepositoryPort,
    private readonly secrets: IntegrationSecretsService
  ) {
    super({ logger: new NoopLogger() });
  }

  protected async handle(
    input: UpdateIntegrationConnectionInput,
    ctx: UseCaseContext
  ): Promise<Result<UpdateIntegrationConnectionOutput, UseCaseError>> {
    const connection = await this.repository.findById(ctx.tenantId!, input.id);
    if (!connection) {
      throw new NotFoundError("Integration connection not found", { id: input.id });
    }

    connection.update({
      displayName: input.displayName,
      status: input.status,
      config: input.config,
      secretEncrypted: input.secret ? this.secrets.encrypt(input.secret) : undefined,
    });

    await this.repository.update(connection);

    return ok({
      connection: connection.toDto(),
    });
  }
}
