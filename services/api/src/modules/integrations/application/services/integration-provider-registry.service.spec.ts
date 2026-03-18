import { describe, expect, it, vi } from "vitest";
import { IntegrationProviderRegistryService } from "./integration-provider-registry.service";
import { IntegrationConnectionEntity } from "../../domain/integration-connection.entity";

describe("IntegrationProviderRegistryService", () => {
  it("returns unsupported when no tester is registered", async () => {
    const service = new IntegrationProviderRegistryService();
    const connection = new IntegrationConnectionEntity({
      id: "conn_1",
      tenantId: "tenant_1",
      workspaceId: "ws_1",
      providerKey: "custom",
      authMethod: "api_key",
      status: "active",
      config: {},
      createdAt: new Date("2026-03-18T00:00:00.000Z"),
      updatedAt: new Date("2026-03-18T00:00:00.000Z"),
    });

    await expect(service.testConnection(connection, null)).resolves.toEqual({
      ok: false,
      code: "Integrations:ProviderUnsupported",
      detail: 'No tester registered for provider "custom"',
    });
  });

  it("delegates to the registered tester", async () => {
    const service = new IntegrationProviderRegistryService();
    const tester = vi.fn().mockResolvedValue({ ok: true });
    const connection = new IntegrationConnectionEntity({
      id: "conn_2",
      tenantId: "tenant_1",
      workspaceId: "ws_1",
      providerKey: "custom",
      authMethod: "oauth2",
      status: "active",
      config: {},
      createdAt: new Date("2026-03-18T00:00:00.000Z"),
      updatedAt: new Date("2026-03-18T00:00:00.000Z"),
    });

    service.register({
      key: "custom",
      displayName: "Custom",
      authMethods: ["oauth2"],
      tester: { test: tester },
    });

    await expect(service.testConnection(connection, "secret")).resolves.toEqual({ ok: true });
    expect(tester).toHaveBeenCalledTimes(1);
  });
});
