import { Injectable } from "@nestjs/common";
import { PasswordHasherPort } from "../../application/ports/password-hasher.port";

type BcryptLikeModule = {
  hash(password: string, saltRounds: number): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
};

let bcryptModulePromise: Promise<BcryptLikeModule> | null = null;

function normalizeBcryptModule(mod: unknown): BcryptLikeModule {
  const candidate =
    mod && typeof mod === "object" && "default" in mod ? (mod as { default: unknown }).default : mod;

  if (
    candidate &&
    typeof candidate === "object" &&
    "hash" in candidate &&
    typeof (candidate as { hash?: unknown }).hash === "function" &&
    "compare" in candidate &&
    typeof (candidate as { compare?: unknown }).compare === "function"
  ) {
    return candidate as BcryptLikeModule;
  }

  throw new TypeError("Loaded bcrypt module does not expose hash/compare");
}

async function loadBcryptModule(): Promise<BcryptLikeModule> {
  if (!bcryptModulePromise) {
    bcryptModulePromise = (async () => {
      try {
        return normalizeBcryptModule(await import("bcrypt"));
      } catch {
        return normalizeBcryptModule(await import("bcryptjs"));
      }
    })();
  }

  return bcryptModulePromise;
}

/**
 * Bcrypt Password Hasher Implementation
 */
@Injectable()
export class BcryptPasswordHasher implements PasswordHasherPort {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    const bcrypt = await loadBcryptModule();
    return bcrypt.hash(password, this.saltRounds);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    const bcrypt = await loadBcryptModule();
    return bcrypt.compare(password, hash);
  }
}
