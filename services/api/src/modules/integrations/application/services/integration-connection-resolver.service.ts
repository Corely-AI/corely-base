import { Inject, Injectable } from "@nestjs/common";
import { ConflictError, NotFoundError } from "@corely/kernel";
import {
  INTEGRATION_CONNECTION_REPOSITORY_PORT,
  type IntegrationConnectionRepositoryPort,
} from "../ports/integration-connection-repository.port";
import { IntegrationSecretsService } from "../../infrastructure/secrets/integration-secrets.service";
import type { IntegrationConnectionEntity } from "../../domain/integration-connection.entity";

export interface ResolvedIntegrationConnection {
  connection: IntegrationConnectionEntity;
  secret: string | null;
}

@Injectable()
export class IntegrationConnectionResolverService {
  constructor(
    @Inject(INTEGRATION_CONNECTION_REPOSITORY_PORT)
    private readonly repository: IntegrationConnectionRepositoryPort,
    private readonly secrets: IntegrationSecretsService
  ) {}

  async resolveById(
    tenantId: string,
    connectionId: string
  ): Promise<ResolvedIntegrationConnection> {
    const connection = await this.repository.findById(tenantId, connectionId);
    if (!connection) {
      throw new NotFoundError("Integration connection not found", { connectionId });
    }

    return {
      connection,
      secret: this.decrypt(connection),
    };
  }

  async resolveActiveByProviderKey(
    tenantId: string,
    workspaceId: string,
    providerKey: string
  ): Promise<ResolvedIntegrationConnection> {
    const connection = await this.repository.findActiveByProviderKey(
      tenantId,
      workspaceId,
      providerKey
    );
    if (!connection) {
      throw new NotFoundError("Active integration connection not found", {
        workspaceId,
        providerKey,
      });
    }

    const secret = this.decrypt(connection);
    if (!secret) {
      throw new ConflictError("Integration connection is missing secret", {
        connectionId: connection.toObject().id,
      });
    }

    return {
      connection,
      secret,
    };
  }

  private decrypt(connection: IntegrationConnectionEntity): string | null {
    const encrypted = connection.toObject().secretEncrypted;
    if (!encrypted) {
      return null;
    }

    return this.secrets.decrypt(encrypted);
  }
}
