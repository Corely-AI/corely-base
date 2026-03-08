import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaService } from "@corely/data";
import { createApiTestApp, createTestDb, stopSharedContainer, type PostgresTestDb } from "@corely/testkit";

vi.setConfig({ hookTimeout: 120_000, testTimeout: 120_000 });

describe("Auth API (E2E)", () => {
  let app: INestApplication;
  let server: any;
  let db: PostgresTestDb;
  let prisma: PrismaService;

  beforeAll(async () => {
    db = await createTestDb();
    app = await createApiTestApp(db);
    server = app.getHttpServer();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await db.reset();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (db) {
      await db.down();
    }
    await stopSharedContainer();
  });

  it("returns health status", async () => {
    const response = await request(server).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.service).toBe("api");
  });

  it("signs up, logs in, and returns the authenticated user", async () => {
    const signup = await request(server)
      .post("/auth/signup")
      .set("x-idempotency-key", "auth-e2e-signup")
      .send({
        email: "e2e@example.com",
        password: "Password123!",
        tenantName: "E2E Tenant",
        userName: "E2E User",
      });

    expect(signup.status).toBe(201);
    expect(signup.body.userId).toBeDefined();
    expect(signup.body.tenantId).toBeDefined();
    expect(signup.body.accessToken).toBeDefined();
    expect(signup.body.refreshToken).toBeDefined();

    const createdUser = await prisma.user.findUnique({
      where: { id: signup.body.userId },
    });
    expect(createdUser?.email).toBe("e2e@example.com");

    const login = await request(server).post("/auth/login").send({
      email: "e2e@example.com",
      password: "Password123!",
      tenantId: signup.body.tenantId,
    });

    expect(login.status).toBe(201);
    expect(login.body.userId).toBe(signup.body.userId);
    expect(login.body.tenantId).toBe(signup.body.tenantId);
    expect(login.body.accessToken).toBeDefined();
    expect(login.body.refreshToken).toBeDefined();

    const me = await request(server)
      .get("/auth/me")
      .set("Authorization", `Bearer ${login.body.accessToken}`);

    expect(me.status).toBe(200);
    expect(me.body.userId).toBe(signup.body.userId);
    expect(me.body.email).toBe("e2e@example.com");
    expect(me.body.activeTenantId).toBe(signup.body.tenantId);
    expect(me.body.memberships).toHaveLength(1);
  });
});
