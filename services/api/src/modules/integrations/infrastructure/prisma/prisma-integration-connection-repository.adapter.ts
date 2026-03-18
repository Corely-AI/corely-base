import { Injectable } from "@nestjs/common";
import { PrismaService } from "@corely/data";
import { Prisma } from "@prisma/client";
import type { IntegrationAuthMethod, IntegrationConnectionStatus } from "@corely/contracts";
import { IntegrationConnectionEntity } from "../../domain/integration-connection.entity";
import type { IntegrationConnectionRepositoryPort } from "../../application/ports/integration-connection-repository.port";

@Injectable()
export class PrismaIntegrationConnectionRepositoryAdapter implements IntegrationConnectionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(connection: IntegrationConnectionEntity): Promise<void> {
    const row = connection.toObject();

    await this.prisma.integrationConnection.create({
      data: {
        id: row.id,
        tenantId: row.tenantId,
        workspaceId: row.workspaceId,
        providerKey: row.providerKey,
        authMethod: row.authMethod,
        status: row.status,
        displayName: row.displayName,
        configJson: this.toNullableJsonInput(row.config),
        secretEncrypted: row.secretEncrypted,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
    });
  }

  async update(connection: IntegrationConnectionEntity): Promise<void> {
    const row = connection.toObject();

    await this.prisma.integrationConnection.update({
      where: {
        id: row.id,
      },
      data: {
        displayName: row.displayName,
        status: row.status,
        configJson: this.toNullableJsonInput(row.config),
        secretEncrypted: row.secretEncrypted,
        updatedAt: row.updatedAt,
      },
    });
  }

  async findById(tenantId: string, id: string): Promise<IntegrationConnectionEntity | null> {
    const row = await this.prisma.integrationConnection.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    return row ? this.toDomain(row) : null;
  }

  async list(
    tenantId: string,
    filter: {
      workspaceId?: string;
      providerKey?: string;
    }
  ): Promise<IntegrationConnectionEntity[]> {
    const rows = await this.prisma.integrationConnection.findMany({
      where: {
        tenantId,
        workspaceId: filter.workspaceId,
        providerKey: filter.providerKey,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async findActiveByProviderKey(
    tenantId: string,
    workspaceId: string,
    providerKey: string
  ): Promise<IntegrationConnectionEntity | null> {
    const row = await this.prisma.integrationConnection.findFirst({
      where: {
        tenantId,
        workspaceId,
        providerKey,
        status: "active",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: {
    id: string;
    tenantId: string;
    workspaceId: string;
    providerKey: string;
    authMethod: string;
    status: string;
    displayName: string | null;
    configJson: unknown;
    secretEncrypted: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): IntegrationConnectionEntity {
    return new IntegrationConnectionEntity({
      id: row.id,
      tenantId: row.tenantId,
      workspaceId: row.workspaceId,
      providerKey: row.providerKey,
      authMethod: row.authMethod as IntegrationAuthMethod,
      status: row.status as IntegrationConnectionStatus,
      displayName: row.displayName,
      config: this.toConfig(row.configJson),
      secretEncrypted: row.secretEncrypted,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toConfig(value: unknown): Record<string, unknown> {
    return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  }

  private toNullableJsonInput(value: unknown): Prisma.JsonNullValueInput | Prisma.InputJsonValue {
    if (value === null || value === undefined) {
      return Prisma.JsonNull;
    }

    return value as Prisma.InputJsonValue;
  }
}
