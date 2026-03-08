import type { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export async function createTenant(
  prisma: PrismaClient,
  data: Partial<{
    id: string;
    name: string;
    slug: string;
    status: string;
    timeZone: string;
  }> = {}
) {
  const tenantId = data.id ?? nanoid();
  return prisma.tenant.create({
    data: {
      id: tenantId,
      name: data.name ?? `Tenant ${tenantId}`,
      slug: data.slug ?? `tenant-${tenantId}`,
      status: data.status ?? "ACTIVE",
      timeZone: data.timeZone ?? "UTC",
    },
  });
}
