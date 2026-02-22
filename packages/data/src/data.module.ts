import { Global, Module } from "@nestjs/common";
import { UNIT_OF_WORK } from "@corely/kernel";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaUnitOfWork } from "./uow/prisma-unit-of-work.adapter";

@Global()
@Module({
  providers: [
    PrismaService,
    PrismaUnitOfWork,
    { provide: UNIT_OF_WORK, useExisting: PrismaUnitOfWork },
  ],
  exports: [
    PrismaService,
    UNIT_OF_WORK,
  ],
})
export class DataModule {}
