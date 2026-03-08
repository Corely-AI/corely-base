import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaService } from "@corely/data";
import {
  createApiTestApp,
  createTestDb,
  seedDefaultTenant,
  stopSharedContainer,
  type PostgresTestDb,
} from "@corely/testkit";
import {
  HEADER_TENANT_ID,
  HEADER_WORKSPACE_ID,
} from "../../../shared/request-context/request-context.headers";

vi.setConfig({ hookTimeout: 120_000, testTimeout: 120_000 });

describe("Todos API (E2E)", () => {
  let app: INestApplication;
  let server: any;
  let db: PostgresTestDb;
  let prisma: PrismaService;
  let tenantId: string;
  let workspaceId: string;
  let userId: string;

  const authedPost = (url: string) =>
    request(server)
      .post(url)
      .set(HEADER_TENANT_ID, tenantId)
      .set(HEADER_WORKSPACE_ID, workspaceId)
      .set("x-user-id", userId);

  const authedGet = (url: string) =>
    request(server)
      .get(url)
      .set(HEADER_TENANT_ID, tenantId)
      .set(HEADER_WORKSPACE_ID, workspaceId)
      .set("x-user-id", userId);

  const authedPatch = (url: string) =>
    request(server)
      .patch(url)
      .set(HEADER_TENANT_ID, tenantId)
      .set(HEADER_WORKSPACE_ID, workspaceId)
      .set("x-user-id", userId);

  const authedDelete = (url: string) =>
    request(server)
      .delete(url)
      .set(HEADER_TENANT_ID, tenantId)
      .set(HEADER_WORKSPACE_ID, workspaceId)
      .set("x-user-id", userId);

  beforeAll(async () => {
    db = await createTestDb();
    app = await createApiTestApp(db);
    server = app.getHttpServer();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await db.reset();
    const seed = await seedDefaultTenant(app);
    tenantId = seed.tenantId;
    workspaceId = seed.workspaceId;
    userId = seed.userId;
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

  it("creates and lists todos for the current tenant", async () => {
    const create = await authedPost("/todos").send({
      title: "Finish VAT report",
      description: "Prepare the monthly filing",
      priority: "high",
      dueDate: "2026-03-31T00:00:00.000Z",
    });

    expect(create.status).toBe(201);
    expect(create.body.id).toBeDefined();
    expect(create.body.tenantId).toBe(tenantId);
    expect(create.body.workspaceId).toBe(workspaceId);
    expect(create.body.title).toBe("Finish VAT report");
    expect(create.body.status).toBe("open");
    expect(create.body.priority).toBe("high");

    const row = await prisma.todo.findUnique({
      where: { id: create.body.id },
    });
    expect(row?.tenantId).toBe(tenantId);
    expect(row?.workspaceId).toBe(workspaceId);

    const list = await authedGet("/todos");

    expect(list.status).toBe(200);
    expect(list.body.items).toHaveLength(1);
    expect(list.body.pageInfo.total).toBe(1);
    expect(list.body.items[0].id).toBe(create.body.id);
  });

  it("updates status through complete and reopen endpoints", async () => {
    const create = await authedPost("/todos").send({
      title: "Call customer",
      priority: "medium",
    });

    const todoId = create.body.id as string;

    const completed = await authedPost(`/todos/${todoId}/complete`).send({});
    expect(completed.status).toBe(201);
    expect(completed.body.status).toBe("done");

    const reopened = await authedPost(`/todos/${todoId}/reopen`).send({});
    expect(reopened.status).toBe(201);
    expect(reopened.body.status).toBe("open");
  });

  it("updates and deletes a todo", async () => {
    const create = await authedPost("/todos").send({
      title: "Initial title",
      description: "Initial description",
      priority: "low",
    });

    const todoId = create.body.id as string;

    const updated = await authedPatch(`/todos/${todoId}`).send({
      title: "Updated title",
      description: null,
      priority: "high",
    });

    expect(updated.status).toBe(200);
    expect(updated.body.title).toBe("Updated title");
    expect(updated.body.description).toBeNull();
    expect(updated.body.priority).toBe("high");

    const deleted = await authedDelete(`/todos/${todoId}`).send({});
    expect(deleted.status).toBe(200);
    expect(deleted.body).toEqual({ success: true });

    const afterDelete = await authedGet(`/todos/${todoId}`);
    expect(afterDelete.status).toBe(404);
  });

  it("does not leak todos across tenants", async () => {
    const myTodo = await authedPost("/todos").send({
      title: "Tenant A todo",
      priority: "medium",
    });
    expect(myTodo.status).toBe(201);

    const otherTenant = await seedDefaultTenant(app);
    const otherList = await request(server)
      .get("/todos")
      .set(HEADER_TENANT_ID, otherTenant.tenantId)
      .set(HEADER_WORKSPACE_ID, otherTenant.workspaceId)
      .set("x-user-id", otherTenant.userId);

    expect(otherList.status).toBe(200);
    expect(otherList.body.items).toHaveLength(0);
    expect(otherList.body.pageInfo.total).toBe(0);
  });
});
