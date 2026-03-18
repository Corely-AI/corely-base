import { Module } from "@nestjs/common";
import { DataModule } from "@corely/data";
import { KernelModule } from "../../shared/kernel/kernel.module";
import { IdentityModule } from "../identity/identity.module";
import { IntegrationsConnectionsController } from "./adapters/http/integrations-connections.controller";
import { IntegrationsApplication } from "./application/integrations.application";
import { CreateIntegrationConnectionUseCase } from "./application/use-cases/create-integration-connection.usecase";
import { ListIntegrationConnectionsUseCase } from "./application/use-cases/list-integration-connections.usecase";
import { UpdateIntegrationConnectionUseCase } from "./application/use-cases/update-integration-connection.usecase";
import { TestIntegrationConnectionUseCase } from "./application/use-cases/test-integration-connection.usecase";
import { PrismaIntegrationConnectionRepositoryAdapter } from "./infrastructure/prisma/prisma-integration-connection-repository.adapter";
import { INTEGRATION_CONNECTION_REPOSITORY_PORT } from "./application/ports/integration-connection-repository.port";
import { IntegrationSecretsService } from "./infrastructure/secrets/integration-secrets.service";
import { IntegrationConnectionResolverService } from "./application/services/integration-connection-resolver.service";
import { IntegrationProviderRegistryService } from "./application/services/integration-provider-registry.service";

@Module({
  imports: [DataModule, KernelModule, IdentityModule],
  controllers: [IntegrationsConnectionsController],
  providers: [
    PrismaIntegrationConnectionRepositoryAdapter,
    {
      provide: INTEGRATION_CONNECTION_REPOSITORY_PORT,
      useExisting: PrismaIntegrationConnectionRepositoryAdapter,
    },
    IntegrationSecretsService,
    IntegrationConnectionResolverService,
    IntegrationProviderRegistryService,
    CreateIntegrationConnectionUseCase,
    ListIntegrationConnectionsUseCase,
    UpdateIntegrationConnectionUseCase,
    TestIntegrationConnectionUseCase,
    {
      provide: IntegrationsApplication,
      useFactory: (
        createConnection: CreateIntegrationConnectionUseCase,
        listConnections: ListIntegrationConnectionsUseCase,
        updateConnection: UpdateIntegrationConnectionUseCase,
        testConnection: TestIntegrationConnectionUseCase
      ) =>
        new IntegrationsApplication(
          createConnection,
          listConnections,
          updateConnection,
          testConnection
        ),
      inject: [
        CreateIntegrationConnectionUseCase,
        ListIntegrationConnectionsUseCase,
        UpdateIntegrationConnectionUseCase,
        TestIntegrationConnectionUseCase,
      ],
    },
  ],
  exports: [
    INTEGRATION_CONNECTION_REPOSITORY_PORT,
    IntegrationConnectionResolverService,
    IntegrationProviderRegistryService,
  ],
})
export class IntegrationsModule {}
