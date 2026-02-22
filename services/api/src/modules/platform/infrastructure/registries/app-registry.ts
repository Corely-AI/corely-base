import { Injectable } from "@nestjs/common";
import type { AppManifest } from "@corely/contracts";
import type { AppRegistryPort } from "../../application/ports/app-registry.port";
import { coreAppManifest } from "../../core.manifest";
import { platformAppManifest } from "../../platform.manifest";
import { workspacesAppManifest } from "../../../workspaces/workspaces.manifest";

@Injectable()
export class AppRegistry implements AppRegistryPort {
  private manifests = new Map<string, AppManifest>();

  constructor() {}

  register(manifest: AppManifest): void {
    this.manifests.set(manifest.appId, manifest);
  }

  get(appId: string): AppManifest | undefined {
    return this.manifests.get(appId);
  }

  list(): AppManifest[] {
    return Array.from(this.manifests.values());
  }

  findByCapability(capability: string): AppManifest[] {
    return this.list().filter((manifest) => manifest.capabilities.includes(capability));
  }

  has(appId: string): boolean {
    return this.manifests.has(appId);
  }

  loadManifests(): void {
    this.register(coreAppManifest);
    this.register(platformAppManifest);
    this.register(workspacesAppManifest);
  }
}
