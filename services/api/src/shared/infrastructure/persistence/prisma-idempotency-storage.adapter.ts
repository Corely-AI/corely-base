import { Injectable, Inject } from "@nestjs/common";
import { PrismaService } from "@corely/data";
import type { IdempotencyStoragePort, StoredResponse } from "../../ports/idempotency-storage.port";

@Injectable()
export class PrismaIdempotencyStorageAdapter implements IdempotencyStoragePort {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get idempotencyDelegate():
    | {
        findUnique: (...args: any[]) => Promise<any>;
        findFirst: (...args: any[]) => Promise<any>;
        upsert: (...args: any[]) => Promise<any>;
        update: (...args: any[]) => Promise<any>;
        create: (...args: any[]) => Promise<any>;
      }
    | null {
    const delegate = (this.prisma as unknown as { idempotencyKey?: unknown }).idempotencyKey;
    if (!delegate || typeof delegate !== "object") {
      return null;
    }
    return delegate as {
      findUnique: (...args: any[]) => Promise<any>;
      findFirst: (...args: any[]) => Promise<any>;
      upsert: (...args: any[]) => Promise<any>;
      update: (...args: any[]) => Promise<any>;
      create: (...args: any[]) => Promise<any>;
    };
  }

  async get(
    actionKey: string,
    tenantId: string | null,
    key: string
  ): Promise<StoredResponse | null> {
    const delegate = this.idempotencyDelegate;
    if (!delegate) {
      return null;
    }

    // When tenantId is null, we can't use findUnique with the compound key
    // so we use findFirst instead
    const existing = tenantId
      ? await delegate.findUnique({
          where: {
            tenantId_actionKey_key: {
              tenantId,
              actionKey,
              key,
            },
          },
        })
      : await delegate.findFirst({
          where: {
            tenantId: null,
            actionKey,
            key,
          },
        });

    if (!existing || !existing.responseJson) {
      return null;
    }
    return {
      statusCode: existing.statusCode ?? undefined,
      body: JSON.parse(existing.responseJson),
    };
  }

  async store(
    actionKey: string,
    tenantId: string | null,
    key: string,
    response: StoredResponse
  ): Promise<void> {
    const delegate = this.idempotencyDelegate;
    if (!delegate) {
      return;
    }

    // When tenantId is null, we can't use upsert with the compound key
    // so we need to handle it differently
    if (tenantId) {
      await delegate.upsert({
        where: {
          tenantId_actionKey_key: {
            tenantId,
            actionKey,
            key,
          },
        },
        update: {
          responseJson: JSON.stringify(response.body ?? null),
          statusCode: response.statusCode,
        },
        create: {
          tenantId,
          actionKey,
          key,
          responseJson: JSON.stringify(response.body ?? null),
          statusCode: response.statusCode,
        },
      });
    } else {
      // For null tenantId, check if it exists first, then create or update
      const existing = await delegate.findFirst({
        where: {
          tenantId: null,
          actionKey,
          key,
        },
      });

      if (existing) {
        await delegate.update({
          where: { id: existing.id },
          data: {
            responseJson: JSON.stringify(response.body ?? null),
            statusCode: response.statusCode,
          },
        });
      } else {
        await delegate.create({
          data: {
            tenantId: null,
            actionKey,
            key,
            responseJson: JSON.stringify(response.body ?? null),
            statusCode: response.statusCode,
          },
        });
      }
    }
  }
}
