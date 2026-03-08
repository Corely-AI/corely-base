import { execa } from "execa";
import { PrismaService } from "@corely/data";

type StartedPostgreSqlContainer = {
  getConnectionUri(): string;
  stop(): Promise<void>;
};

let sharedContainer: StartedPostgreSqlContainer | null = null;
let activeDbCount = 0;

export class PostgresTestDb {
  private prisma: PrismaService | null = null;
  private connectionString: string | null = null;
  private started = false;
  private usingExternalDatabase = false;

  async up(): Promise<void> {
    if (this.started) {
      return;
    }

    const externalUrl = process.env.CORELY_TEST_DATABASE_URL?.trim();
    if (externalUrl) {
      this.connectionString = externalUrl;
      this.usingExternalDatabase = true;
    } else {
      const { PostgreSqlContainer } = await import("@testcontainers/postgresql");
      if (!sharedContainer) {
        sharedContainer = await new PostgreSqlContainer("postgres:16-alpine")
          .withDatabase("corely_test")
          .withUsername("corely")
          .withPassword("corely")
          .start();
      }
      this.connectionString = sharedContainer.getConnectionUri();
    }

    this.started = true;
    activeDbCount += 1;
    process.env.DATABASE_URL = this.connectionString;
    process.env.NODE_ENV = "test";
  }

  private async ensureClient(): Promise<PrismaService> {
    if (!this.prisma) {
      this.prisma = new PrismaService();
      await this.prisma.$connect();
    }
    return this.prisma;
  }

  get url(): string {
    if (!this.connectionString) {
      throw new Error("Test DB not started");
    }
    return this.connectionString;
  }

  get client(): PrismaService {
    if (!this.prisma) {
      throw new Error("Test DB not started");
    }
    return this.prisma;
  }

  async migrate(): Promise<void> {
    if (!this.connectionString) {
      throw new Error("Test DB not started");
    }

    try {
      await execa(
        "pnpm",
        ["--filter", "@corely/data", "exec", "prisma", "migrate", "deploy", "--schema", "prisma/schema"],
        {
          env: { ...process.env, DATABASE_URL: this.connectionString },
          stdio: "pipe",
        }
      );

      await execa(
        "pnpm",
        ["--filter", "@corely/data", "exec", "prisma", "generate", "--schema", "prisma/schema"],
        {
          env: { ...process.env, DATABASE_URL: this.connectionString },
          stdio: "pipe",
        }
      );
    } catch (error: any) {
      console.error("Migrate/Generate failed:", error.stderr || error.message);
      throw error;
    }

    await this.ensureClient();
  }

  async reset(): Promise<void> {
    const prisma = this.client;
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT IN ('_prisma_migrations');
    `;

    const tableNames = tables.map((table) => `"${table.tablename}"`);
    if (!tableNames.length) {
      return;
    }

    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${tableNames.join(", ")} RESTART IDENTITY CASCADE;`
    );
  }

  async down(): Promise<void> {
    if (!this.started) {
      return;
    }

    this.started = false;
    if (this.prisma) {
      await this.prisma.$disconnect();
    }

    this.prisma = null;
    this.connectionString = null;
    this.usingExternalDatabase = false;
    if (activeDbCount > 0) {
      activeDbCount -= 1;
    }
  }
}

export async function createTestDb(): Promise<PostgresTestDb> {
  const db = new PostgresTestDb();
  await db.up();
  await db.migrate();
  await db.reset();
  return db;
}

export async function stopSharedContainer(force = false): Promise<void> {
  if (!force) {
    return;
  }

  if (sharedContainer && activeDbCount === 0) {
    await sharedContainer.stop();
    sharedContainer = null;
  }
}
