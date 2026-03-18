import { Injectable } from "@nestjs/common";
import type { IntegrationAuthMethod, TestIntegrationConnectionOutput } from "@corely/contracts";
import { ValidationError } from "@corely/kernel";
import type { IntegrationConnectionEntity } from "../../domain/integration-connection.entity";

export interface IntegrationProviderDefinition {
  key: string;
  displayName: string;
  authMethods: IntegrationAuthMethod[];
  capabilities?: string[];
}

export interface IntegrationProviderTester {
  test(input: {
    connection: IntegrationConnectionEntity;
    secret: string | null;
    provider: IntegrationProviderDefinition;
  }): Promise<TestIntegrationConnectionOutput>;
}

interface RegisteredIntegrationProvider extends IntegrationProviderDefinition {
  tester?: IntegrationProviderTester;
}

@Injectable()
export class IntegrationProviderRegistryService {
  private readonly providers = new Map<string, RegisteredIntegrationProvider>();

  register(provider: RegisteredIntegrationProvider): void {
    const key = provider.key.trim();
    if (!key) {
      throw new ValidationError("Provider key is required");
    }

    this.providers.set(key, {
      ...provider,
      key,
      capabilities: provider.capabilities ?? [],
    });
  }

  list(): IntegrationProviderDefinition[] {
    return Array.from(this.providers.values())
      .map(({ tester: _tester, ...provider }) => provider)
      .sort((left, right) => left.key.localeCompare(right.key));
  }

  get(providerKey: string): IntegrationProviderDefinition | null {
    const provider = this.providers.get(providerKey);
    if (!provider) {
      return null;
    }

    const { tester: _tester, ...definition } = provider;
    return definition;
  }

  async testConnection(
    connection: IntegrationConnectionEntity,
    secret: string | null
  ): Promise<TestIntegrationConnectionOutput> {
    const provider = this.providers.get(connection.toObject().providerKey);

    if (!provider?.tester) {
      return {
        ok: false,
        code: "Integrations:ProviderUnsupported",
        detail: `No tester registered for provider "${connection.toObject().providerKey}"`,
      };
    }

    return provider.tester.test({
      connection,
      secret,
      provider: {
        key: provider.key,
        displayName: provider.displayName,
        authMethods: provider.authMethods,
        capabilities: provider.capabilities ?? [],
      },
    });
  }
}
