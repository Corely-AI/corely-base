import { Global, Module } from "@nestjs/common";
import { UNIT_OF_WORK } from "@corely/kernel";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaUnitOfWork } from "./uow/prisma-unit-of-work.adapter";
import { PrismaExtKvAdapter } from "./adapters/prisma-ext-kv.adapter";
import { EXT_KV_PORT } from "./ports/ext-storage.port";

@Global()
@Module({
  providers: [
    PrismaService,
    PrismaUnitOfWork,
    PrismaExtKvAdapter,
    { provide: UNIT_OF_WORK, useExisting: PrismaUnitOfWork },
    { provide: EXT_KV_PORT, useExisting: PrismaExtKvAdapter },
  ],
  exports: [
    PrismaService,
    UNIT_OF_WORK,
    EXT_KV_PORT,
  ],
})
export class DataModule {}
